// ─────────────────────────────────────────────────────────────────────────────
// cierre.service.js — Frontend Sprint 10
// Servicio de API para Consolidación Mensual y Cierre Contable
//
// Conecta las vistas de contabilidad con el backend.
// Roles habilitados: Contador, Administrador del Sistema, Presidente / Gerente
// ─────────────────────────────────────────────────────────────────────────────

import api from '../utils/axios';

/**
 * Act-1: Obtiene el resumen contable-operativo de un proyecto/periodo.
 * NO persiste datos — es solo previsualización.
 *
 * @param {string} idProyecto — UUID del proyecto
 * @param {string} mesAnio    — Formato "YYYY-MM"
 * @returns {Promise<object>} Payload de consolidación
 */
export const fetchConsolidacion = async (idProyecto, mesAnio) => {
  const { data } = await api.get('/cierres-contables/consolidacion', {
    params: { idProyecto, mesAnio },
  });
  return data.data;
};

/**
 * Act-2: Ejecuta la validación pre-cierre.
 * Devuelve { valido: bool, errores: [], advertencias: [] }
 *
 * @param {string} idProyecto
 * @param {string} mesAnio — "YYYY-MM"
 * @returns {Promise<{ valido: boolean, errores: Array, advertencias: Array }>}
 */
export const postValidarPreCierre = async (idProyecto, mesAnio) => {
  const { data } = await api.post('/cierres-contables/validar', {
    idProyecto,
    mesAnio,
  });
  return data.data;
};

/**
 * Act-3 + Act-5: Ejecuta el cierre mensual transaccional.
 * Si hay errores de validación, el backend responde 422.
 * Si hay error de sistema, el backend revierte (ROLLBACK) y responde 500.
 *
 * @param {string} idProyecto
 * @param {string} mesAnio — "YYYY-MM"
 * @returns {Promise<{ cierre: object, consolidacion: object, advertencias: Array }>}
 */
export const postEjecutarCierre = async (idProyecto, mesAnio) => {
  const { data } = await api.post('/cierres-contables/ejecutar', {
    idProyecto,
    mesAnio,
  });
  return data.data;
};

/**
 * Lista el historial de cierres, opcionalmente filtrado por proyecto.
 *
 * @param {object} [filtros]
 * @param {string} [filtros.idProyecto]
 * @param {number} [filtros.limit=20]
 * @param {number} [filtros.offset=0]
 * @returns {Promise<{ data: Array, total: number }>}
 */
export const fetchCierres = async ({ idProyecto, limit = 20, offset = 0 } = {}) => {
  const params = { limit, offset };
  if (idProyecto) params.idProyecto = idProyecto;

  const { data } = await api.get('/cierres-contables', { params });
  return data;
};

/**
 * Obtiene el detalle completo de un cierre por ID.
 * Incluye consolidación y hash de integridad SHA-256.
 *
 * @param {string} idCierre — UUID del cierre
 * @returns {Promise<{ cierre: object, consolidacion: object }>}
 */
export const fetchCierreById = async (idCierre) => {
  const { data } = await api.get(`/cierres-contables/${idCierre}`);
  return data.data;
};

/**
 * Rechaza un consumo y crea un movimiento inverso de AJUSTE.
 * @param {string} idMovimiento
 * @param {string} observacion
 * @returns {Promise<object>}
 */
export const postRechazarConsumo = async (idMovimiento, observacion) => {
  const { data } = await api.post('/cierres-contables/rechazar-consumo', {
    idMovimiento,
    observacion,
  });
  return data.data;
};

/**
 * Aprueba (valida) un consumo registrándolo en el audit_log.
 * No modifica el movimiento ni el inventario: solo deja trazabilidad
 * de que el contador revisó y aprobó el consumo.
 * @param {string} idMovimiento
 * @returns {Promise<object>}
 */
export const postAprobarConsumo = async (idMovimiento) => {
  const { data } = await api.post('/cierres-contables/aprobar-consumo', {
    idMovimiento,
  });
  return data.data;
};
