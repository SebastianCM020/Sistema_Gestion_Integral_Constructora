// ─────────────────────────────────────────────────────────────────────────────
// compras.service.js — Sprint 6: Servicio de API para Requerimientos de Compra
//
// Estrategia: Online-First. Si el backend no está disponible se lanza el error
// para que la UI informe al usuario (no hay fallback offline para escritura).
// ─────────────────────────────────────────────────────────────────────────────

import api from '../utils/axios';

/**
 * Crea un requerimiento de compra.
 *
 * @param {string} idProyecto
 * @param {object} datos
 * @param {string}  datos.justificacion          - Obligatoria, no vacía
 * @param {Array}   datos.detalles               - [{idMaterial, cantidadSolicitada}]
 * @returns {Promise<{message: string, data: object}>}
 * @throws {AxiosError} con error.response.data.error si la validación falla (400/422)
 */
export const crearRequerimiento = async (idProyecto, { justificacion, detalles }) => {
  const { data } = await api.post(
    `/compras/proyectos/${idProyecto}/requerimientos`,
    { justificacion, detalles }
  );
  return data;
};

/**
 * Obtiene la lista de requerimientos de un proyecto.
 *
 * @param {string} idProyecto
 * @param {object} [filtros]
 * @param {string} [filtros.estado] - 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'RECIBIDO'
 * @returns {Promise<{data: Array, total: number}>}
 */
export const fetchRequerimientos = async (idProyecto, { estado } = {}) => {
  const params = {};
  if (estado) params.estado = estado;

  const { data } = await api.get(
    `/compras/proyectos/${idProyecto}/requerimientos`,
    { params }
  );
  return data;
};

/**
 * Obtiene el detalle de un requerimiento.
 *
 * @param {string} id - UUID del requerimiento
 * @returns {Promise<{data: object}>}
 */
export const fetchRequerimiento = async (id) => {
  const { data } = await api.get(`/compras/requerimientos/${id}`);
  return data;
};

/**
 * Aprueba un requerimiento (solo Admin y Presidente/Gerente).
 *
 * @param {string} id
 * @returns {Promise<{message: string, data: object}>}
 */
export const aprobarRequerimiento = async (id) => {
  const { data } = await api.put(`/compras/requerimientos/${id}/aprobar`);
  return data;
};

/**
 * Rechaza un requerimiento con comentario obligatorio.
 *
 * @param {string} id
 * @param {string} comentarioRechazo
 * @returns {Promise<{message: string, data: object}>}
 */
export const rechazarRequerimiento = async (id, comentarioRechazo) => {
  const { data } = await api.put(`/compras/requerimientos/${id}/rechazar`, {
    comentarioRechazo,
  });
  return data;
};

/**
 * Obtiene la bandeja gerencial: requerimientos pendientes EN_REVISION.
 * Solo accesible por Admin y Presidente/Gerente.
 *
 * @param {object} [opciones]
 * @param {number} [opciones.limit=50]
 * @param {number} [opciones.offset=0]
 * @returns {Promise<{data: Array, total: number}>}
 */
export const fetchBandejaGerencial = async ({ limit = 50, offset = 0 } = {}) => {
  const { data } = await api.get('/compras/bandeja-gerencial', {
    params: { limit, offset },
  });
  return data;
};

/**
 * Obtiene las notificaciones del usuario de compras.
 *
 * @returns {Promise<{data: Array}>}
 */
export const fetchNotificaciones = async () => {
  const { data } = await api.get('/compras/notificaciones');
  return data;
};
