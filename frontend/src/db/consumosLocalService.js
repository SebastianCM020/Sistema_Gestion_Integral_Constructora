// ─────────────────────────────────────────────────────────────────────────────
// consumosLocalService.js — Sprint 9: Gestión local de consumos en obra
//
// Capa de persistencia offline para consumos. Los consumos creados sin internet
// se guardan en IndexedDB con sync_status='pending' y son procesados por el
// SyncManager cuando se recupera la conexión.
//
// Estados de sync_status:
//   'pending'   → Creado offline, pendiente de enviar al servidor
//   'synced'    → Confirmado por el servidor (tiene server_id)
//   'error'     → Intentó sincronizarse y fue rechazado permanentemente
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import db from './database';

/**
 * Guarda un consumo localmente con estado 'pending'.
 * Genera un idempotencyKey único (UUID v4) para prevenir duplicados en el servidor.
 *
 * @param {object} consumoData
 * @param {string} consumoData.idProyecto
 * @param {string} consumoData.idMaterial
 * @param {string} consumoData.idUsuario
 * @param {number} consumoData.cantidad
 * @param {string} [consumoData.observacion]
 * @returns {Promise<object>} Registro guardado localmente
 */
export const guardarConsumoLocal = async ({
  idProyecto,
  idMaterial,
  idUsuario,
  cantidad,
  observacion = '',
}) => {
  const localId        = uuidv4();
  const idempotencyKey = uuidv4(); // Clave única para prevenir duplicación en el servidor

  const record = {
    id:              localId,
    idempotencyKey,  // Sprint 9 HU-S9-4: La clave viaja al servidor para evitar duplicados
    idProyecto,
    idMaterial,
    idUsuario,
    cantidad:        parseFloat(cantidad),
    observacion,
    sync_status:     'pending',
    sync_attempts:   0,
    sync_error:      null,
    server_id:       null,
    local_created_at: new Date().toISOString(),
    sync_timestamp:  null,
  };

  await db.consumos_local.add(record);
  return record;
};

/**
 * Obtiene todos los consumos pendientes de sincronizar.
 * @returns {Promise<Array>}
 */
export const getConsumosPendientes = async () => {
  return db.consumos_local.where('sync_status').equals('pending').toArray();
};

/**
 * Obtiene todos los consumos (para mostrar historial local).
 * @param {string} [idProyecto] - Filtro opcional por proyecto
 * @returns {Promise<Array>}
 */
export const getAllConsumos = async (idProyecto) => {
  if (idProyecto) {
    return db.consumos_local
      .where('idProyecto').equals(idProyecto)
      .reverse()
      .sortBy('local_created_at');
  }
  return db.consumos_local.orderBy('local_created_at').reverse().toArray();
};

/**
 * Marca un consumo como sincronizado con el servidor.
 * @param {string} localId     - UUID local del consumo
 * @param {object} serverData  - Datos retornados por el servidor
 */
export const marcarConsumoSincronizado = async (localId, serverData) => {
  await db.consumos_local.update(localId, {
    sync_status:    'synced',
    server_id:      serverData?.id ?? null,
    sync_timestamp: new Date().toISOString(),
    sync_error:     null,
  });
};

/**
 * Marca un consumo con error de sincronización.
 * @param {string} localId     - UUID local del consumo
 * @param {string} errorMsg    - Mensaje de error del servidor
 * @param {boolean} [permanent=false] - Si true, marca como error permanente (no reintentar)
 */
export const marcarConsumoError = async (localId, errorMsg, permanent = false) => {
  const updates = {
    sync_error: errorMsg,
    sync_timestamp: new Date().toISOString(),
  };

  if (permanent) {
    updates.sync_status = 'error'; // Error permanente: no se reintenta
  } else {
    updates.sync_status = 'pending'; // Error temporal: se reintenta
  }

  // Incrementar contador de intentos
  const current = await db.consumos_local.get(localId);
  if (current) {
    updates.sync_attempts = (current.sync_attempts || 0) + 1;
  }

  await db.consumos_local.update(localId, updates);
};

/**
 * Cuenta los consumos pendientes de sincronizar.
 * @returns {Promise<number>}
 */
export const contarConsumosPendientes = async () => {
  return db.consumos_local.where('sync_status').equals('pending').count();
};

/**
 * Elimina consumos sincronizados anteriores a una fecha (limpieza opcional).
 * @param {Date} antes - Fecha límite
 */
export const limpiarConsumosSincronizados = async (antes) => {
  await db.consumos_local
    .where('sync_status').equals('synced')
    .filter((c) => new Date(c.sync_timestamp) < antes)
    .delete();
};
