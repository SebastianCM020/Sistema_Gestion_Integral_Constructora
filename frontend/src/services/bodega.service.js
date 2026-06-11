// ─────────────────────────────────────────────────────────────────────────────
// bodega.service.js — Sprint 8: Servicio de API para bodega
//
// Estrategia offline-first: online → servidor, offline → IndexedDB local.
// Nuevas operaciones Sprint 8:
//   - fetchRequerimientosAprobados: lista reqs APROBADOS del proyecto.
//   - recepcionarMateriales: recepción transaccional vinculada a requerimiento.
// ─────────────────────────────────────────────────────────────────────────────

import api from '../utils/axios';
import {
  guardarMovimientoOffline,
  listarMovimientosOffline,
  obtenerInventarioOffline,
  contarPendientes,
} from '../db/movimientosLocalService';

// ─── Sprint 8: Nuevas funciones de recepción transaccional ───────────────────

/**
 * Obtiene los requerimientos en estado APROBADO de un proyecto.
 * CA HU-S8-1: Solo se muestran requerimientos APROBADOS del proyecto autorizado.
 *
 * @param {string} idProyecto
 * @param {boolean} [isOnline=true]
 * @returns {Promise<{data: Array, total: number}>}
 */
export const fetchRequerimientosAprobados = async (idProyecto, isOnline = true) => {
  if (isOnline) {
    try {
      const { data } = await api.get(
        `/bodega/proyectos/${idProyecto}/requerimientos-aprobados`
      );
      return { data: data.data, total: data.total, fromCache: false };
    } catch (error) {
      // Errores 4xx: lanzar para que el componente informe al usuario
      if (error.response && error.response.status < 500) throw error;
      console.warn('[bodega] requerimientos aprobados no disponibles online:', error.message);
    }
  }
  // Sin conexión: retornar vacío (no hay cache offline para requerimientos aprobados)
  return { data: [], total: 0, fromCache: true };
};

/**
 * Recepciona materiales de un requerimiento APROBADO (operación transaccional).
 *
 * CA HU-S8-2 / HU-S8-3:
 *   - Si el requerimiento NO está APROBADO → servidor retorna 422 con alerta clara.
 *   - Si la cantidad supera la solicitada → servidor retorna 422 con alerta clara.
 *   - El frontend debe mostrar el mensaje de error como alerta visible.
 *
 * @param {object} datos
 * @param {string}  datos.idProyecto
 * @param {string}  datos.idRequerimiento
 * @param {Array}   datos.detallesRecepcion - [{idMaterial, cantidadRecibida, observacion?}]
 * @param {boolean} [datos.isOnline=true]
 * @returns {Promise<{data: object, message: string}>}
 * @throws {AxiosError} con error.response.data.error si la validación falla (4xx)
 */
export const recepcionarMateriales = async ({
  idProyecto,
  idRequerimiento,
  detallesRecepcion,
  isOnline = true,
}) => {
  if (isOnline) {
    // En este endpoint NO hay fallback offline — la recepción requiere BD.
    // Los errores de validación (4xx) se propagan para que la UI los muestre como alerta.
    const { data } = await api.post(
      `/bodega/proyectos/${idProyecto}/requerimientos/${idRequerimiento}/recepcionar`,
      { detallesRecepcion }
    );
    return { data: data.data, message: data.message, fromCache: false };
  }

  // Modo offline: no se puede procesar recepción vinculada a requerimiento sin BD.
  throw new Error(
    'La recepción de materiales requiere conexión al servidor. ' +
    'Por favor, conecte el dispositivo y reintente.'
  );
};

// ─── Sprint 3 (original): Movimiento libre ───────────────────────────────────

/**
 * Registra un movimiento libre de inventario.
 * Si hay conexión: llama al API del servidor.
 * Si no hay conexión: guarda en IndexedDB con sync_status='pending'.
 *
 * @param {object} datos
 * @param {string} datos.idProyecto
 * @param {string} datos.idMaterial
 * @param {string} datos.idUsuario
 * @param {'ENTRADA'|'SALIDA'|'AJUSTE'} datos.tipoMovimiento
 * @param {number} datos.cantidad
 * @param {string} [datos.observacion]
 * @param {boolean} [datos.isOnline=true]
 */
export const registrarMovimiento = async ({
  idProyecto,
  idMaterial,
  idUsuario,
  tipoMovimiento,
  cantidad,
  observacion,
  isOnline = true,
}) => {
  if (isOnline) {
    try {
      const { data } = await api.post(
        `/bodega/proyectos/${idProyecto}/movimientos`,
        { idMaterial, tipoMovimiento, cantidad, observacion }
      );
      return { data: data.data, fromCache: false, message: data.message };
    } catch (error) {
      if (!error.response || error.response.status >= 500) {
        console.warn('[bodega] Servidor no disponible, guardando offline:', error.message);
      } else {
        throw error;
      }
    }
  }

  const movimiento = await guardarMovimientoOffline({
    id_material:     idMaterial,
    id_proyecto:     idProyecto,
    id_usuario:      idUsuario,
    tipo_movimiento: tipoMovimiento,
    cantidad,
    observacion,
  });

  const pendientes = await contarPendientes();

  return {
    data:      movimiento,
    fromCache: true,
    message:   `Movimiento guardado localmente. ${pendientes} registro(s) pendiente(s) de sincronizar.`,
  };
};

/**
 * Lista el historial de movimientos de un proyecto.
 * @param {string} idProyecto
 * @param {object} params
 * @param {boolean} [params.isOnline=true]
 */
export const fetchMovimientos = async (
  idProyecto,
  { tipoMovimiento, page = 1, limit = 20, isOnline = true } = {}
) => {
  if (isOnline) {
    try {
      const params = { page, limit };
      if (tipoMovimiento) params.tipoMovimiento = tipoMovimiento;

      const { data } = await api.get(
        `/bodega/proyectos/${idProyecto}/movimientos`,
        { params }
      );
      return { ...data, fromCache: false };
    } catch (error) {
      console.warn('[bodega] Historial no disponible online, usando local:', error.message);
    }
  }

  const data = await listarMovimientosOffline(idProyecto, tipoMovimiento);
  return {
    data,
    pagination: { total: data.length, page: 1, limit: data.length },
    fromCache: true,
  };
};

/**
 * Obtiene el inventario actual de un proyecto con desglose de movimientos.
 * CA HU-S8-4: Incluye saldo calculado, entradas, salidas y diferencias.
 *
 * @param {string} idProyecto
 * @param {boolean} [isOnline=true]
 */
export const fetchInventario = async (idProyecto, isOnline = true) => {
  if (isOnline) {
    try {
      const { data } = await api.get(`/bodega/proyectos/${idProyecto}/inventario`);
      return { data: data.data, total: data.total, fromCache: false };
    } catch (error) {
      console.warn('[bodega] Inventario no disponible online, usando local:', error.message);
    }
  }

  const data = await obtenerInventarioOffline(idProyecto);
  return { data, total: data.length, fromCache: true };
};
