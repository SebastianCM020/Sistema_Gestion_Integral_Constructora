// ─────────────────────────────────────────────────────────────────────────────
// ordenCambio.controller.js - Sprint 7
//
// Responsabilidad única: traducir HTTP ↔ dominio para el módulo de
// Órdenes de Cambio. Toda la lógica vive en ordenCambio.service.js.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const ordenCambioService = require('../services/ordenCambio.service');

/**
 * POST /api/v1/ordenes-cambio/proyectos/:idProyecto
 * Crea una orden de cambio en estado PENDIENTE.
 * Body: { idRubro, motivo, cantidadAdicional }
 */
const crearOrdenCambio = async (req, res) => {
  try {
    const { idProyecto }   = req.params;
    const idSolicitante    = req.user.id;
    const { idRubro, motivo, cantidadAdicional } = req.body;

    const orden = await ordenCambioService.crearOrdenCambio({
      idProyecto,
      idRubro,
      idSolicitante,
      motivo,
      cantidadAdicional,
    });

    return res.status(201).json({
      message: 'Orden de cambio creada correctamente en estado PENDIENTE.',
      data:    orden,
    });
  } catch (error) {
    console.error('[OrdenCambio] crearOrdenCambio:', error.message);
    return res.status(error.status || 500).json({
      error: error.message || 'Error interno al crear la orden de cambio.',
      campo: error.campo   || undefined,
    });
  }
};

/**
 * GET /api/v1/ordenes-cambio/proyectos/:idProyecto
 * Lista las órdenes de cambio de un proyecto.
 * Query: ?estado=PENDIENTE|APROBADA|RECHAZADA&idRubro=UUID
 */
const listarOrdenesCambio = async (req, res) => {
  try {
    const { idProyecto } = req.params;
    const { estado, idRubro } = req.query;

    const ordenes = await ordenCambioService.listarOrdenesCambio(idProyecto, { estado, idRubro });
    return res.status(200).json({ data: ordenes, total: ordenes.length });
  } catch (error) {
    console.error('[OrdenCambio] listarOrdenesCambio:', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno.' });
  }
};

/**
 * PUT /api/v1/ordenes-cambio/:id/aprobar
 * Aprueba una orden de cambio PENDIENTE.
 * Body: { comentario? }
 * RBAC: Admin y Presidente/Gerente.
 */
const aprobarOrdenCambio = async (req, res) => {
  try {
    const { id }      = req.params;
    const idAprobador = req.user.id;
    const { comentario } = req.body;

    const actualizada = await ordenCambioService.aprobarOrdenCambio(id, idAprobador, comentario);
    return res.status(200).json({
      message: 'Orden de cambio aprobada correctamente.',
      data:    actualizada,
    });
  } catch (error) {
    console.error('[OrdenCambio] aprobarOrdenCambio:', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno.' });
  }
};

/**
 * PUT /api/v1/ordenes-cambio/:id/rechazar
 * Rechaza una orden de cambio PENDIENTE.
 * Body: { comentario } — obligatorio
 * RBAC: Admin y Presidente/Gerente.
 */
const rechazarOrdenCambio = async (req, res) => {
  try {
    const { id }         = req.params;
    const idAprobador    = req.user.id;
    const { comentario } = req.body;

    const actualizada = await ordenCambioService.rechazarOrdenCambio(id, idAprobador, comentario);
    return res.status(200).json({
      message: 'Orden de cambio rechazada.',
      data:    actualizada,
    });
  } catch (error) {
    console.error('[OrdenCambio] rechazarOrdenCambio:', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno.' });
  }
};

/**
 * GET /api/v1/ordenes-cambio/validar-excedente
 * Consulta si un avance excedente está permitido por orden de cambio.
 * Query: ?idRubro=UUID&cantidadAvance=NUMBER
 * Usado desde el formulario de avance en el frontend antes de enviar.
 */
const validarExcedente = async (req, res) => {
  try {
    const { idRubro, cantidadAvance } = req.query;
    if (!idRubro || !cantidadAvance) {
      return res.status(400).json({ error: 'Se requieren idRubro y cantidadAvance.' });
    }

    const resultado = await ordenCambioService.validarExcedentePorOrdenCambio(
      idRubro,
      parseFloat(cantidadAvance)
    );

    return res.status(200).json({ data: resultado });
  } catch (error) {
    console.error('[OrdenCambio] validarExcedente:', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno.' });
  }
};

module.exports = {
  crearOrdenCambio,
  listarOrdenesCambio,
  aprobarOrdenCambio,
  rechazarOrdenCambio,
  validarExcedente,
};
