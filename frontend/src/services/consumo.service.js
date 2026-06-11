// ─────────────────────────────────────────────────────────────────────────────
// consumo.service.js — Sprint 9: Servicio de Consumo en Obra (Frontend)
//
// Estrategia Offline-First para HU-S9-2 / HU-S9-4:
//   1. Si hay conexión: POST al servidor con idempotencyKey.
//   2. Si no hay conexión: guardar en IndexedDB para sincronizar luego.
//
// El idempotencyKey generado en el cliente garantiza que el servidor nunca
// procese el mismo consumo dos veces, incluso si hay reconexiones o reintentos.
// ─────────────────────────────────────────────────────────────────────────────

import api from '../utils/axios';
import {
  guardarConsumoLocal,
  contarConsumosPendientes,
} from '../db/consumosLocalService';

// ── Helper para detectar fallo de red ────────────────────────────────────────
const isNetworkError = (error) =>
  !navigator.onLine ||
  error?.message?.includes('Failed to fetch') ||
  error?.message?.includes('NetworkError') ||
  error?.message?.includes('Load failed') ||
  error?.code === 'ERR_NETWORK';

// ── HU-S9-1: Materiales disponibles para el proyecto del residente ────────────

/**
 * Obtiene los materiales activos con stock > 0 del proyecto asignado al residente.
 * Solo retorna materiales del proyecto autorizado y vigente.
 *
 * CA HU-S9-1: El residente no puede ver ni consumir materiales de proyectos ajenos.
 *
 * @param {string}  idProyecto
 * @param {boolean} [isOnline=true]
 * @returns {Promise<{data: Array, total: number, fromCache: boolean}>}
 */
export const fetchMaterialesDisponibles = async (idProyecto, isOnline = true) => {
  if (!idProyecto) return { data: [], total: 0, fromCache: false };

  if (isOnline) {
    try {
      const { data } = await api.get(
        `/consumo/proyectos/${idProyecto}/materiales-disponibles`
      );
      return { data: data.data ?? [], total: data.total ?? 0, fromCache: false };
    } catch (error) {
      // Errores 4xx (forbidden, etc.): propagar para que el componente informe al usuario
      if (error.response && error.response.status < 500) throw error;
      console.warn('[consumo] materiales no disponibles online, usando mock/vacío:', error.message);
    }
  }

  // Sin conexión: retornar vacío (los materiales requieren BD actualizada)
  return { data: [], total: 0, fromCache: true };
};

// ── HU-S9-2 / HU-S9-3 / HU-S9-4: Registrar consumo ─────────────────────────

/**
 * Registra el consumo de un material en obra.
 *
 * Online:  POST al backend → validaciones de seguridad + transacción atómica.
 * Offline: guarda en IndexedDB con idempotencyKey → SyncManager lo enviará luego.
 *
 * CA HU-S9-3: El servidor rechaza con error específico si:
 *   - Stock insuficiente    → 422 STOCK_INSUFICIENTE
 *   - Proyecto ajeno        → 403 PROYECTO_NO_AUTORIZADO
 *   - Concurrencia          → 409 CONFLICTO_CONCURRENCIA
 *
 * @param {object}  datos
 * @param {string}  datos.idProyecto
 * @param {string}  datos.idMaterial
 * @param {string}  datos.idUsuario
 * @param {number}  datos.cantidad
 * @param {string}  [datos.observacion]
 * @param {boolean} [datos.isOnline=true]
 * @returns {Promise<{
 *   success:       boolean,
 *   offline:       boolean,
 *   data?:         object,
 *   message:       string,
 *   stockAnterior?: number,
 *   stockActual?:  number,
 *   idempotente?:  boolean,
 *   localId?:      string,
 *   pendientes?:   number,
 *   code?:         string,
 * }>}
 */
export const registrarConsumoApi = async ({
  idProyecto,
  idMaterial,
  idUsuario,
  cantidad,
  observacion = '',
  isOnline = true,
}) => {
  if (isOnline) {
    try {
      // En modo online, el idempotencyKey lo genera el servidor, pero para
      // consistencia con el flujo offline se puede generar en el cliente
      // y enviar en el body. Aquí lo genera el servidor para máxima seguridad.
      const { data } = await api.post(
        `/consumo/proyectos/${idProyecto}/consumir`,
        {
          idMaterial,
          cantidad,
          observacion,
          // idempotencyKey omitido en modo online puro (sin retry previo)
          // El servidor asignará uno si no se proporciona
        }
      );

      return {
        success:       true,
        offline:       false,
        data:          data.data,
        message:       data.message,
        stockAnterior: data.stockAnterior,
        stockActual:   data.stockActual,
        idempotente:   data.idempotente ?? false,
      };

    } catch (error) {
      // Errores de negocio (4xx): propagarlos al componente para mostrar mensaje
      if (error.response && !isNetworkError(error)) {
        const errData = error.response.data || {};
        return {
          success:  false,
          offline:  false,
          message:  errData.error || `Error HTTP ${error.response.status}`,
          code:     errData.codigo || null,
          detalle:  errData.detalle || null,
        };
      }

      // Error de red → fallback offline
      if (!isNetworkError(error)) {
        console.error('[consumo] Error inesperado (no de red):', error);
        return {
          success:  false,
          offline:  false,
          message:  `Error interno: ${error.message}`,
        };
      }
    }
  }

  // ── Modo offline: guardar en IndexedDB ───────────────────────────────────
  try {
    const localRecord = await guardarConsumoLocal({
      idProyecto,
      idMaterial,
      idUsuario,
      cantidad,
      observacion,
    });

    const pendientes = await contarConsumosPendientes();

    // Registrar Background Sync si está disponible
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-consumos');
      } catch (syncErr) {
        console.warn('[consumo] Background Sync no disponible:', syncErr.message);
      }
    }

    return {
      success:   true,
      offline:   true,
      localId:   localRecord.id,
      pendientes,
      message:   `📶 Sin conexión: El consumo fue guardado localmente y se sincronizará cuando haya red. (${pendientes} pendiente(s))`,
    };

  } catch (offlineErr) {
    console.error('[consumo] Error al guardar offline:', offlineErr);
    return {
      success: false,
      offline: true,
      message: `Error al guardar offline: ${offlineErr.message}`,
    };
  }
};

// ── Historial de consumos del proyecto ────────────────────────────────────────

/**
 * Obtiene el historial de consumos (movimientos SALIDA) de un proyecto.
 *
 * @param {string}  idProyecto
 * @param {object}  [params]
 * @param {string}  [params.idMaterial]
 * @param {number}  [params.page=1]
 * @param {number}  [params.limit=20]
 * @param {boolean} [params.isOnline=true]
 */
export const fetchHistorialConsumos = async (
  idProyecto,
  { idMaterial, page = 1, limit = 20, isOnline = true } = {}
) => {
  if (!idProyecto) return { data: [], pagination: { total: 0, page: 1, limit } };

  if (isOnline) {
    try {
      const queryParams = { page, limit };
      if (idMaterial) queryParams.idMaterial = idMaterial;

      const { data } = await api.get(
        `/consumo/proyectos/${idProyecto}/historial`,
        { params: queryParams }
      );
      return { ...data, fromCache: false };
    } catch (error) {
      console.warn('[consumo] Historial no disponible online:', error.message);
    }
  }

  // Sin conexión: retornar vacío
  return {
    data:       [],
    pagination: { total: 0, page: 1, limit, totalPages: 0 },
    fromCache:  true,
  };
};
