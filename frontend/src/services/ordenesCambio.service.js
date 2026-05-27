// ─────────────────────────────────────────────────────────────────────────────
// ordenesCambio.service.js - Sprint 7: API de Órdenes de Cambio
//
// Permite al frontend interactuar con el módulo de Órdenes de Cambio:
//   - Crear una orden de cambio cuando un avance supera el presupuesto
//   - Aprobar / Rechazar (solo Presidente/Gerente y Admin)
//   - Consultar el estado presupuestario antes de enviar un avance
// ─────────────────────────────────────────────────────────────────────────────

import api from '../utils/axios';

/**
 * Crea una nueva orden de cambio en estado PENDIENTE.
 *
 * @param {string} idProyecto
 * @param {object} datos
 * @param {string} datos.idRubro
 * @param {string} datos.motivo
 * @param {number} datos.cantidadAdicional
 * @returns {Promise<{message: string, data: object}>}
 */
export const crearOrdenCambio = async (idProyecto, { idRubro, motivo, cantidadAdicional }) => {
  const { data } = await api.post(
    `/ordenes-cambio/proyectos/${idProyecto}`,
    { idRubro, motivo, cantidadAdicional }
  );
  return data;
};

/**
 * Lista las órdenes de cambio de un proyecto.
 *
 * @param {string} idProyecto
 * @param {object} [filtros]
 * @param {string} [filtros.estado] - 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
 * @param {string} [filtros.idRubro]
 * @returns {Promise<{data: Array, total: number}>}
 */
export const fetchOrdenesCambio = async (idProyecto, { estado, idRubro } = {}) => {
  const params = {};
  if (estado)  params.estado  = estado;
  if (idRubro) params.idRubro = idRubro;

  const { data } = await api.get(`/ordenes-cambio/proyectos/${idProyecto}`, { params });
  return data;
};

/**
 * Aprueba una orden de cambio.
 *
 * @param {string} id
 * @param {string} [comentario]
 * @returns {Promise<{message: string, data: object}>}
 */
export const aprobarOrdenCambio = async (id, comentario) => {
  const { data } = await api.put(`/ordenes-cambio/${id}/aprobar`, { comentario });
  return data;
};

/**
 * Rechaza una orden de cambio.
 *
 * @param {string} id
 * @param {string} comentario - obligatorio
 * @returns {Promise<{message: string, data: object}>}
 */
export const rechazarOrdenCambio = async (id, comentario) => {
  const { data } = await api.put(`/ordenes-cambio/${id}/rechazar`, { comentario });
  return data;
};

/**
 * Valida si un avance excedente está cubierto por una orden de cambio aprobada.
 * Útil para pre-validar en el formulario de avance antes de enviarlo.
 *
 * @param {string} idRubro
 * @param {number} cantidadAvance
 * @returns {Promise<{data: {permitido: boolean, excedente: boolean, margenDisponible: number, idOrden: string|null, mensaje: string|null}}>}
 */
export const validarExcedentePresupuesto = async (idRubro, cantidadAvance) => {
  const { data } = await api.get('/ordenes-cambio/validar-excedente', {
    params: { idRubro, cantidadAvance },
  });
  return data;
};
