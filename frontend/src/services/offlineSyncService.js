import { avancesLocalService } from '../db/avancesLocalService';
import { openDB } from 'idb';

const API_BASE   = '/api/v1';

const DB_NAME    = 'icaro_offline_db';
const STORE_NAME = 'sync_queue';

// ─── Inicializar base de datos IndexedDB ────────────────────────────────────
export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// ─── Guardar en cola offline ─────────────────────────────────────────────────
export const saveToSyncQueue = async (endpoint, payload) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.add({
    endpoint,
    payload,
    timestamp: new Date().toISOString(),
  });
  await tx.done;
  console.info('[OfflineSync] Registro encolado en IndexedDB para sincronización posterior.');
};

// ─── Obtener items pendientes de sincronizar (Combinado) ──────────────────────
export const getPendingSyncItems = async () => {
  const db = await initDB();
  const legacyItems = await db.getAll(STORE_NAME);
  const avancesPendientes = await avancesLocalService.getPending();
  return [...legacyItems, ...avancesPendientes];
};

// ─── Eliminar item de la cola al sincronizarse (Legacy) ───────────────────────
export const removeSyncItem = async (id) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
};

// ─── Helper para detectar fallo de red ──────────────────────────────────────
const isNetworkError = (error) =>
  !navigator.onLine ||
  error?.message?.includes('Failed to fetch') ||
  error?.message?.includes('NetworkError') ||
  error?.message?.includes('Load failed');

// ─── Helper para obtener token JWT ──────────────────────────────────────────
const getAuthHeaders = (isFormData = false) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem('icaro_token') || ''}`,
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// ─── Registrar avance (Online First, Offline Fallback) ───────────────────────
/**
 * @param {FormData|Object} payload - Datos del avance (FormData si incluye evidencia)
 */
export const registrarAvanceApi = async (payload) => {
  const isFormData = payload instanceof FormData;

  try {
    const response = await fetch(`${API_BASE}/avances`, {
      method: 'POST',
      headers: getAuthHeaders(isFormData),
      body: isFormData ? payload : JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err.message || err.error || `Error HTTP ${response.status}`;
      return { success: false, offline: false, message: msg, code: err.code };
    }

    const data = await response.json();
    return { ...data, offline: false };

  } catch (error) {
    if (isNetworkError(error)) {
      // Guardar en Dexie para Sprint 5 (Offline-first con estados)
      let localData = {};
      let evidencia = null;

      if (isFormData) {
        localData = {
          idRubro: payload.get('idRubro'),
          idProyecto: payload.get('idProyecto'),
          cantidadAvance: payload.get('cantidadEjecutada'),
          notas: payload.get('observaciones'),
          fechaRegistro: payload.get('fechaRegistro'),
        };
        evidencia = payload.get('evidencia');
      } else {
        localData = payload;
      }

      const localRecord = await avancesLocalService.saveLocal(localData, evidencia);

      // Intentar registrar Background Sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-avances');
        } catch (syncErr) {
          console.warn('[OfflineSync] Background Sync no disponible:', syncErr.message);
        }
      }

      return {
        success: true,
        offline: true,
        localId: localRecord.id,
        message: '📶 Sin conexión: El avance fue guardado localmente y se sincronizará automáticamente.',
      };
    }

    console.error('[OfflineSync] Error inesperado:', error);
    return { success: false, offline: false, message: `Error interno: ${error.message}` };
  }
};

// ─── Obtener historial de avances por rubro ──────────────────────────────────
export const fetchAvancesPorRubro = async (idRubro) => {
  if (!idRubro) return [];

  try {
    const response = await fetch(`${API_BASE}/avances/rubro/${idRubro}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('icaro_token') || ''}` },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Error HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];

  } catch (error) {
    if (isNetworkError(error)) {
      console.warn('[OfflineSync] Sin conexión — historial no disponible en modo offline.');
      return [];
    }
    // Error de servidor: log y retornar vacío para no romper la UI
    console.error('[OfflineSync] Error al obtener historial del rubro:', error);
    return [];
  }
};

// ─── Sincronizar cola pendiente al recuperar la red ─────────────────────────
/**
 * Procesa todos los registros encolados (legacy + avances locales) y los envía al backend.
 * Retorna un resumen del resultado para mostrar en la UI.
 * @returns {{ synced: number, failed: number, errors: string[] }}
 */
export const syncPendingQueue = async () => {
  const legacyDb = await initDB();
  const legacyItems = await legacyDb.getAll(STORE_NAME);
  const avancesPendientes = await avancesLocalService.getPending();
  
  if (legacyItems.length === 0 && avancesPendientes.length === 0) {
    return { synced: 0, failed: 0, errors: [] };
  }

  const token = localStorage.getItem('icaro_token') || '';
  let synced = 0;
  let failed = 0;
  const errors = [];

  // 1. Sincronizar Items Legacy
  for (const item of legacyItems) {
    try {
      const response = await fetch(item.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item.payload),
      });

      if (response.ok) {
        await removeSyncItem(item.id);
        synced++;
      } else {
        const err = await response.json().catch(() => ({}));
        if (response.status === 400 || response.status === 403) {
          await removeSyncItem(item.id);
          errors.push(`Rechazado (regla de negocio): ${err.message || response.status}`);
          failed++;
        } else {
          failed++;
          errors.push(`Error del servidor (${response.status}): se reintentará.`);
        }
      }
    } catch (networkErr) {
      console.warn('[OfflineSync] Sync interrumpida por error de red:', networkErr.message);
      failed++;
      break;
    }
  }

  // 2. Sincronizar Avances Locales (Sprint 5)
  for (const avance of avancesPendientes) {
    try {
      const formData = new FormData();
      formData.append('idRubro', avance.idRubro);
      formData.append('idProyecto', avance.idProyecto);
      formData.append('cantidadEjecutada', avance.cantidadAvance);
      if (avance.notas) formData.append('observaciones', avance.notas);
      if (avance.fechaRegistro) formData.append('fechaRegistro', avance.fechaRegistro);
      if (avance.evidencia) formData.append('evidencia', avance.evidencia, 'evidencia_sync.jpg');

      const response = await fetch(`${API_BASE}/avances`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // No enviar Content-Type, fetch lo establece con boundary para FormData
        },
        body: formData,
      });

      if (response.ok) {
        const respData = await response.json();
        await avancesLocalService.markAsSynced(avance.id, respData.data || {});
        synced++;
      } else {
        const err = await response.json().catch(() => ({}));
        if (response.status === 400 || response.status === 403) {
           await avancesLocalService.markAsError(avance.id, err.message || 'Error de negocio');
           errors.push(`Avance rechazado: ${err.message || response.status}`);
           failed++;
        } else {
           failed++;
           errors.push(`Error del servidor al sincronizar avance (${response.status}).`);
        }
      }
    } catch (networkErr) {
      console.warn('[OfflineSync] Sync de avance interrumpida:', networkErr.message);
      failed++;
      break;
    }
  }

  console.info(`[OfflineSync] Sincronización completada. Enviados: ${synced}, Fallidos: ${failed}`);
  return { synced, failed, errors };
};
