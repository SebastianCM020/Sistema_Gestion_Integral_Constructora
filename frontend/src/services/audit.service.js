// ─────────────────────────────────────────────────────────────────────────────
// audit.service.js — Servicio de API para Trazabilidad y Auditoría
//
// Conecta el módulo de Auditoría del frontend con el endpoint real del backend.
// Solo accesible por Administrador del Sistema (RBAC aplicado en backend).
// ─────────────────────────────────────────────────────────────────────────────

import api from '../utils/axios';

/**
 * Obtiene los registros de auditoría del backend (audit_log).
 *
 * @param {object} [filtros]
 * @param {number} [filtros.limit=50]
 * @param {number} [filtros.offset=0]
 * @param {string} [filtros.tabla]       - Ej: 'requerimiento_compra'
 * @param {string} [filtros.operacion]   - 'INSERT' | 'UPDATE' | 'DELETE'
 * @param {string} [filtros.idUsuario]   - UUID del usuario
 * @param {string} [filtros.idRegistro]  - UUID del registro
 * @param {string} [filtros.desde]       - ISO date string (fecha inicio)
 * @param {string} [filtros.hasta]       - ISO date string (fecha fin)
 * @returns {Promise<{data: Array, total: number, limit: number, offset: number}>}
 */
export const fetchAuditLogs = async ({
  limit = 50,
  offset = 0,
  tabla,
  operacion,
  idUsuario,
  idRegistro,
  desde,
  hasta,
} = {}) => {
  const params = { limit, offset };
  if (tabla)       params.tabla       = tabla;
  if (operacion)   params.operacion   = operacion;
  if (idUsuario)   params.idUsuario   = idUsuario;
  if (idRegistro)  params.idRegistro  = idRegistro;
  if (desde)       params.desde       = desde;
  if (hasta)       params.hasta       = hasta;

  const { data } = await api.get('/audit-logs', { params });
  return data;
};
