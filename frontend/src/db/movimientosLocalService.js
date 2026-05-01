// ─────────────────────────────────────────────────────────────────────────────
// movimientosLocalService.js — HT-04: Operaciones offline de bodega
// Los movimientos creados sin internet se guardan como sync_status='pending'.
// El SyncManager (Sprint 4) los enviará cuando haya conexión.
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';

/**
 * Registra un movimiento de inventario en la BD local.
 * Nace con sync_status='pending' si está offline.
 *
 * @param {object} datos
 * @param {string} datos.id_material
 * @param {string} datos.id_proyecto
 * @param {string} datos.id_usuario
 * @param {'ENTRADA'|'SALIDA'|'AJUSTE'} datos.tipo_movimiento
 * @param {number} datos.cantidad
 * @param {string} [datos.observacion]
 */
export const guardarMovimientoOffline = async ({
  id_material,
  id_proyecto,
  id_usuario,
  tipo_movimiento,
  cantidad,
  observacion = '',
}) => {
  // 1. Obtener el stock actual local
  const inventario = await db.inventario_local
    .get([id_material, id_proyecto]);

  const cantidad_anterior   = inventario?.cantidad_disponible ?? 0;
  const cantidadNum         = parseFloat(cantidad);
  let   cantidad_resultante;

  if (tipo_movimiento === 'ENTRADA') {
    cantidad_resultante = cantidad_anterior + cantidadNum;
  } else if (tipo_movimiento === 'SALIDA') {
    cantidad_resultante = cantidad_anterior - cantidadNum;
    if (cantidad_resultante < 0) {
      throw new Error(`Stock insuficiente. Disponible: ${cantidad_anterior}`);
    }
  } else {
    cantidad_resultante = cantidadNum; // AJUSTE
  }

  const ahora = new Date().toISOString();

  // 2. Guardar el movimiento con UUID local
  const movimiento = {
    id:                  uuidv4(),
    id_material,
    id_proyecto,
    id_usuario,
    tipo_movimiento,
    cantidad:            cantidadNum,
    cantidad_anterior,
    cantidad_resultante,
    observacion,
    fecha_movimiento:    ahora,
    sync_status:         'pending',   // ← Sprint 4 lo enviará al servidor
    sync_error:          null,
    local_created_at:    ahora,
  };
  await db.movimientos_inventario_local.add(movimiento);

  // 3. Actualizar el inventario local
  await db.inventario_local.put({
    id_material,
    id_proyecto,
    cantidad_disponible:  cantidad_resultante,
    ultima_actualizacion: ahora,
    sync_status:          'pending',
  });

  return movimiento;
};

/**
 * Lista movimientos locales de un proyecto.
 * @param {string} id_proyecto
 * @param {string} [tipo_movimiento] - Filtro opcional
 */
export const listarMovimientosOffline = async (id_proyecto, tipo_movimiento) => {
  let collection = db.movimientos_inventario_local.where('id_proyecto').equals(id_proyecto);

  const resultados = await collection.toArray();

  if (tipo_movimiento) {
    return resultados.filter((m) => m.tipo_movimiento === tipo_movimiento);
  }

  return resultados.sort(
    (a, b) => new Date(b.local_created_at) - new Date(a.local_created_at)
  );
};

/**
 * Obtiene el inventario local de un proyecto.
 * @param {string} id_proyecto
 */
export const obtenerInventarioOffline = async (id_proyecto) => {
  return db.inventario_local.where('id_proyecto').equals(id_proyecto).toArray();
};

/**
 * Cuenta los movimientos pendientes de sincronizar.
 * Sprint 4 usará esto para mostrar el badge de "N registros por sincronizar".
 */
export const contarPendientes = async () => {
  return db.movimientos_inventario_local.where('sync_status').equals('pending').count();
};

/**
 * Sincroniza en la BD local los movimientos confirmados por el servidor.
 * Sprint 4 llamará esto tras un POST exitoso.
 * @param {string[]} ids - UUIDs locales que ya fueron subidos
 */
export const marcarComoSincronizados = async (ids) => {
  await db.movimientos_inventario_local
    .where('id').anyOf(ids)
    .modify({ sync_status: 'synced', sync_error: null });
};
