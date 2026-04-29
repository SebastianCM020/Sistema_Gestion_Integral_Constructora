// ─────────────────────────────────────────────────────────────────────────────
// bodega.service.js — Servicio de API para bodega (movimientos e inventario)
// Estrategia offline-first: online → servidor, offline → IndexedDB local
// ─────────────────────────────────────────────────────────────────────────────

import api from '../utils/axios';
import {
  guardarMovimientoOffline,
  listarMovimientosOffline,
  obtenerInventarioOffline,
  contarPendientes,
} from '../db/movimientosLocalService';

/**
 * Registra un movimiento de inventario.
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
      // Si el servidor falla (ej: 5xx), guardar offline como contingencia
      if (!error.response || error.response.status >= 500) {
        console.warn('[bodega] Servidor no disponible, guardando offline:', error.message);
      } else {
        // Error de negocio (4xx): lanzar para que el formulario lo muestre
        throw error;
      }
    }
  }

  // --- Modo offline o fallback de servidor ---
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
    data:       movimiento,
    fromCache:  true,
    message:    `Movimiento guardado localmente. ${pendientes} registro(s) pendiente(s) de sincronizar.`,
  };
};

/**
 * Lista el historial de movimientos de un proyecto.
 * @param {string} idProyecto
 * @param {object} params
 * @param {boolean} [params.isOnline=true]
 */
export const fetchMovimientos = async (idProyecto, { tipoMovimiento, page = 1, limit = 20, isOnline = true } = {}) => {
  if (isOnline) {
    try {
      const params = { page, limit };
      if (tipoMovimiento) params.tipoMovimiento = tipoMovimiento;

      const { data } = await api.get(`/bodega/proyectos/${idProyecto}/movimientos`, { params });
      return { ...data, fromCache: false };
    } catch (error) {
      console.warn('[bodega] Historial no disponible online, usando local:', error.message);
    }
  }

  const data = await listarMovimientosOffline(idProyecto, tipoMovimiento);
  return { data, pagination: { total: data.length, page: 1, limit: data.length }, fromCache: true };
};

/**
 * Obtiene el inventario actual de un proyecto.
 * @param {string} idProyecto
 * @param {boolean} isOnline
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
