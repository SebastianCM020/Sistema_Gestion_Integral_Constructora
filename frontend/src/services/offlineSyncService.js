import { openDB } from 'idb';

const DB_NAME    = 'icaro_offline_db';
const STORE_NAME = 'sync_queue';
const API_BASE   = 'http://localhost:3001/api/v1';

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

// ─── Obtener items pendientes de sincronizar ─────────────────────────────────
export const getPendingSyncItems = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

// ─── Eliminar item de la cola al sincronizarse ────────────────────────────────
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
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('icaro_token') || ''}`,
});

// ─── Registrar avance (Online First, Offline Fallback) ───────────────────────
export const registrarAvanceApi = async (payload) => {
  try {
    const response = await fetch(`${API_BASE}/avances`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err.message || err.error || `Error HTTP ${response.status}`;
      // Error de negocio (ej. presupuesto excedido) — no es offline, retornar estructura normalizada
      return { success: false, offline: false, message: msg, code: err.code };
    }

    return await response.json();

  } catch (error) {
    if (isNetworkError(error)) {
      // Guardar en IndexedDB para sincronización posterior
      await saveToSyncQueue(`${API_BASE}/avances`, payload);

      // Intentar registrar Background Sync del Service Worker
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
        message: '📶 Sin conexión: El avance fue guardado localmente y se sincronizará automáticamente al recuperar la red.',
      };
    }

    // Error inesperado — propagar con mensaje claro
    console.error('[OfflineSync] Error inesperado al registrar avance:', error);
    return {
      success: false,
      offline: false,
      message: `Error interno: ${error.message}`,
    };
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
 * Procesa todos los registros encolados en IndexedDB y los envía al backend.
 * Retorna un resumen del resultado para mostrar en la UI.
 * @returns {{ synced: number, failed: number, errors: string[] }}
 */
export const syncPendingQueue = async () => {
  const items = await getPendingSyncItems();
  if (items.length === 0) return { synced: 0, failed: 0, errors: [] };

  const token = localStorage.getItem('icaro_token') || '';
  let synced = 0;
  let failed = 0;
  const errors = [];

  for (const item of items) {
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
        // Si es error de negocio (ej. presupuesto excedido), eliminar de la cola
        // para no reintentar infinitamente — el dato es inválido
        if (response.status === 400 || response.status === 403) {
          await removeSyncItem(item.id);
          errors.push(`Rubro rechazado (regla de negocio): ${err.message || response.status}`);
          failed++;
        } else {
          // Error de servidor (5xx): dejar en cola para el próximo intento
          failed++;
          errors.push(`Error del servidor (${response.status}): se reintentará.`);
        }
      }
    } catch (networkErr) {
      // Perdió conexión durante la sincronización
      console.warn('[OfflineSync] Sync interrumpida por error de red:', networkErr.message);
      failed++;
      break; // No tiene sentido seguir si la red falló
    }
  }

  console.info(`[OfflineSync] Sincronización completada. Enviados: ${synced}, Fallidos: ${failed}`);
  return { synced, failed, errors };
};
