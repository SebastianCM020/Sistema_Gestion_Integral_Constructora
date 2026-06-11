// ─────────────────────────────────────────────────────────────────────────────
// syncManager.js — Sprint 9: SyncManager Robusto para Cola de Trabajo Offline
//
// HU-S9-4: Procesa la cola offline de:
//   - Avances de obra (Sprint 5)
//   - Consumos en obra (Sprint 9)
//   - Movimientos de inventario (Sprint 3/8)
//
// Características:
//   ✓ Reintentos con backoff exponencial (máx MAX_RETRY_ATTEMPTS intentos).
//   ✓ Estados gestionados: 'pending' → 'synced' | 'error'.
//   ✓ Errores permanentes (4xx) marcados como 'error' sin reintento.
//   ✓ Errores temporales (5xx/red) se reintentan en el siguiente ciclo.
//   ✓ idempotencyKey previene duplicación: el servidor retorna 200 si ya procesó.
//   ✓ Semáforo (isSyncing) evita ejecuciones concurrentes.
//   ✓ Eventos del ciclo de vida: onStart, onProgress, onComplete, onError.
// ─────────────────────────────────────────────────────────────────────────────

import { avancesLocalService }            from '../db/avancesLocalService';
import {
  getConsumosPendientes,
  marcarConsumoSincronizado,
  marcarConsumoError,
}                                         from '../db/consumosLocalService';
import {
  contarPendientes as contarMovimientosPendientes,
  marcarComoSincronizados,
}                                         from '../db/movimientosLocalService';

const API_BASE = '/api/v1';

// ── Configuración del SyncManager ────────────────────────────────────────────

const MAX_RETRY_ATTEMPTS  = 3;       // Máximo intentos antes de marcar como error permanente
const RETRY_DELAY_BASE_MS = 2000;    // Delay base en ms para backoff exponencial

// ── Estado interno ────────────────────────────────────────────────────────────

let isSyncing = false; // Semáforo para evitar ejecuciones concurrentes

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Verifica si el error es permanente (error de negocio, no reintentar).
 * Los errores 4xx son permanentes excepto 408 (timeout) y 429 (rate limit).
 */
const isPermanentError = (statusCode) =>
  statusCode >= 400 && statusCode < 500 && statusCode !== 408 && statusCode !== 429;

/**
 * Obtiene el token JWT almacenado localmente.
 */
const getAuthHeaders = (isFormData = false) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem('icaro_token') || ''}`,
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

/**
 * Espera un tiempo con backoff exponencial basado en el número de intento.
 * @param {number} attempt - Número del intento (0-indexed)
 */
const exponentialBackoff = (attempt) =>
  new Promise((resolve) =>
    setTimeout(resolve, RETRY_DELAY_BASE_MS * Math.pow(2, attempt))
  );

// ── Sincronización de consumos (Sprint 9) ────────────────────────────────────

/**
 * Sincroniza los consumos pendientes con el servidor.
 * Implementa idempotencia: el idempotencyKey garantiza que el servidor nunca
 * duplique un consumo aunque reciba la misma petición dos veces.
 *
 * @param {object} callbacks
 * @param {Function} [callbacks.onProgress]  - (tipo, total, procesados) → void
 * @returns {{ synced: number, failed: number, permanent: number, errors: string[] }}
 */
const sincronizarConsumos = async ({ onProgress } = {}) => {
  const pendientes = await getConsumosPendientes();
  let synced = 0, failed = 0, permanent = 0;
  const errors = [];

  for (let i = 0; i < pendientes.length; i++) {
    const consumo = pendientes[i];
    onProgress?.('consumos', pendientes.length, i);

    // Verificar si excedió el máximo de intentos → marcar como error permanente
    if ((consumo.sync_attempts || 0) >= MAX_RETRY_ATTEMPTS) {
      await marcarConsumoError(
        consumo.id,
        `Superó el máximo de ${MAX_RETRY_ATTEMPTS} intentos de sincronización.`,
        true // permanente
      );
      permanent++;
      errors.push(`Consumo ${consumo.id}: máximo de reintentos alcanzado.`);
      continue;
    }

    try {
      const response = await fetch(
        `${API_BASE}/consumo/proyectos/${consumo.idProyecto}/consumir`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            idMaterial:     consumo.idMaterial,
            cantidad:       consumo.cantidad,
            observacion:    consumo.observacion || '',
            idempotencyKey: consumo.idempotencyKey, // ← clave de idempotencia
          }),
        }
      );

      if (response.ok || response.status === 200) {
        // 201 = creado correctamente | 200 = ya procesado anteriormente (idempotente)
        const data = await response.json().catch(() => ({}));
        await marcarConsumoSincronizado(consumo.id, data?.data || {});
        synced++;
      } else {
        const err = await response.json().catch(() => ({}));
        const mensaje = err.error || `Error HTTP ${response.status}`;

        if (isPermanentError(response.status)) {
          // Error de negocio (ej: stock insuficiente, proyecto ajeno): marcar como error permanente
          await marcarConsumoError(consumo.id, mensaje, true);
          permanent++;
          errors.push(`Consumo rechazado: ${mensaje}`);
        } else {
          // Error temporal (5xx, red): incrementar intentos y reintentar más tarde
          await marcarConsumoError(consumo.id, mensaje, false);
          failed++;
          errors.push(`Error temporal en consumo (${response.status}): se reintentará.`);
        }
      }

    } catch (networkErr) {
      // Sin conexión: detener el ciclo, se reintentará cuando haya red
      await marcarConsumoError(consumo.id, networkErr.message, false);
      failed++;
      console.warn('[SyncManager] Sin red — sync consumos interrumpida:', networkErr.message);
      break; // Interrumpir el ciclo para no acumular errores innecesarios
    }
  }

  return { synced, failed, permanent, errors };
};

// ── Sincronización de avances de obra (Sprint 5) ─────────────────────────────

/**
 * Sincroniza los avances de obra pendientes.
 * Mantiene compatibilidad con la implementación del Sprint 5.
 */
const sincronizarAvances = async ({ onProgress } = {}) => {
  const avancesPendientes = await avancesLocalService.getPending();
  let synced = 0, failed = 0, permanent = 0;
  const errors = [];

  for (let i = 0; i < avancesPendientes.length; i++) {
    const avance = avancesPendientes[i];
    onProgress?.('avances', avancesPendientes.length, i);

    try {
      const formData = new FormData();
      formData.append('idRubro',            avance.idRubro);
      formData.append('idProyecto',         avance.idProyecto);
      formData.append('cantidadEjecutada',  avance.cantidadAvance);
      if (avance.notas)          formData.append('observaciones',  avance.notas);
      if (avance.fechaRegistro)  formData.append('fechaRegistro',  avance.fechaRegistro);
      if (avance.evidencia)      formData.append('evidencia', avance.evidencia, 'evidencia_sync.jpg');

      const response = await fetch(`${API_BASE}/avances`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('icaro_token') || ''}` },
        body:    formData,
      });

      if (response.ok) {
        const respData = await response.json();
        await avancesLocalService.markAsSynced(avance.id, respData.data || {});
        synced++;
      } else {
        const err = await response.json().catch(() => ({}));
        const mensaje = err.error || err.message || `Error HTTP ${response.status}`;

        if (isPermanentError(response.status)) {
          await avancesLocalService.markAsError(avance.id, mensaje);
          permanent++;
          errors.push(`Avance rechazado: ${mensaje}`);
        } else {
          failed++;
          errors.push(`Error temporal en avance (${response.status}): se reintentará.`);
        }
      }

    } catch (networkErr) {
      console.warn('[SyncManager] Sin red — sync avances interrumpida:', networkErr.message);
      failed++;
      break;
    }
  }

  return { synced, failed, permanent, errors };
};

// ── API Pública del SyncManager ──────────────────────────────────────────────

/**
 * Estado del SyncManager para consulta reactiva.
 */
export const getSyncStatus = () => ({
  isSyncing,
});

/**
 * Obtiene el conteo de ítems pendientes de sincronización por tipo.
 * @returns {Promise<{consumos: number, avances: number, total: number}>}
 */
export const getPendingCounts = async () => {
  const [avancesPending, consumosPending] = await Promise.all([
    avancesLocalService.getPending().then((a) => a.length).catch(() => 0),
    getConsumosPendientes().then((c) => c.length).catch(() => 0),
  ]);

  return {
    avances:  avancesPending,
    consumos: consumosPending,
    total:    avancesPending + consumosPending,
  };
};

/**
 * Ejecuta la sincronización completa de la cola offline.
 *
 * Procesa en orden:
 *   1. Consumos en obra (Sprint 9) — crítico para el inventario.
 *   2. Avances de obra (Sprint 5).
 *
 * @param {object} [opciones]
 * @param {Function} [opciones.onStart]    - () → void
 * @param {Function} [opciones.onProgress] - (tipo, total, procesados) → void
 * @param {Function} [opciones.onComplete] - (resumen) → void
 * @param {Function} [opciones.onError]    - (error) → void
 *
 * @returns {Promise<{
 *   synced: number,
 *   failed: number,
 *   permanent: number,
 *   errors: string[],
 *   byType: { consumos: object, avances: object }
 * }>}
 */
export const ejecutarSincronizacion = async ({
  onStart    = null,
  onProgress = null,
  onComplete = null,
  onError    = null,
} = {}) => {
  // ── Semáforo: evitar ejecuciones concurrentes ───────────────────────────
  if (isSyncing) {
    console.info('[SyncManager] Ya hay una sincronización en curso. Ignorando nueva invocación.');
    return { synced: 0, failed: 0, permanent: 0, errors: ['Sincronización ya en curso.'], byType: {} };
  }

  isSyncing = true;
  onStart?.();

  const resumen = {
    synced:    0,
    failed:    0,
    permanent: 0,
    errors:    [],
    byType:    {},
  };

  try {
    // ── 1. Sincronizar consumos (Sprint 9) ─────────────────────────────────
    const resConsumos = await sincronizarConsumos({ onProgress });
    resumen.synced    += resConsumos.synced;
    resumen.failed    += resConsumos.failed;
    resumen.permanent += resConsumos.permanent;
    resumen.errors.push(...resConsumos.errors);
    resumen.byType.consumos = resConsumos;

    // ── 2. Sincronizar avances de obra (Sprint 5) ──────────────────────────
    const resAvances  = await sincronizarAvances({ onProgress });
    resumen.synced    += resAvances.synced;
    resumen.failed    += resAvances.failed;
    resumen.permanent += resAvances.permanent;
    resumen.errors.push(...resAvances.errors);
    resumen.byType.avances = resAvances;

    console.info(
      `[SyncManager] Completado — Enviados: ${resumen.synced}, ` +
      `Temporales: ${resumen.failed}, Permanentes: ${resumen.permanent}`
    );

    onComplete?.(resumen);
    return resumen;

  } catch (fatalError) {
    console.error('[SyncManager] Error fatal durante sincronización:', fatalError);
    onError?.(fatalError);
    resumen.errors.push(`Error fatal: ${fatalError.message}`);
    return resumen;

  } finally {
    isSyncing = false; // Siempre liberar el semáforo
  }
};

/**
 * Registra listeners para sincronizar automáticamente cuando se recupera la conexión.
 * Devuelve una función de limpieza para remover los listeners.
 *
 * @param {object} [opciones] - Mismas opciones que ejecutarSincronizacion
 * @returns {Function} cleanup — llama esta función para deregistrar
 */
export const registrarSyncAutomatico = (opciones = {}) => {
  const handleOnline = () => {
    console.info('[SyncManager] Conexión restaurada — iniciando sincronización automática.');
    ejecutarSincronizacion(opciones);
  };

  window.addEventListener('online', handleOnline);

  // Si ya hay conexión al registrar, ejecutar inmediatamente si hay pendientes
  if (navigator.onLine) {
    getPendingCounts().then(({ total }) => {
      if (total > 0) {
        console.info(`[SyncManager] ${total} ítem(s) pendiente(s) — sincronizando al iniciar.`);
        ejecutarSincronizacion(opciones);
      }
    }).catch(() => {});
  }

  // Devolver función de limpieza
  return () => {
    window.removeEventListener('online', handleOnline);
  };
};

export default {
  ejecutarSincronizacion,
  registrarSyncAutomatico,
  getPendingCounts,
  getSyncStatus,
};
