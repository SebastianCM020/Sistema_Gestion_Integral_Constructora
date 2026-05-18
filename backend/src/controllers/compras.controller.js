// ─────────────────────────────────────────────────────────────────────────────
// compras.controller.js — Sprint 6: Controlador de Requerimientos de Compra
//
// Responsabilidad única: traducir HTTP ↔ dominio.
// Toda la lógica de negocio vive en compras.service.js.
// ─────────────────────────────────────────────────────────────────────────────

const comprasService       = require('../services/compras.service');
const { obtenerBandejaGerencial } = require('../services/notification.service');

/**
 * POST /api/v1/compras/proyectos/:idProyecto/requerimientos
 * Crea un nuevo requerimiento de compra.
 * RBAC: Admin, Residente, Presidente/Gerente.
 */
const crearRequerimiento = async (req, res) => {
  try {
    const { idProyecto }   = req.params;
    const idSolicitante    = req.user.id;
    const { justificacion, detalles } = req.body;

    const requerimiento = await comprasService.crearRequerimiento({
      idProyecto,
      idSolicitante,
      justificacion,
      detalles,
    });

    return res.status(201).json({
      message: 'Requerimiento creado correctamente en estado EN_REVISIÓN.',
      data:    requerimiento,
    });
  } catch (error) {
    console.error('[compras] crearRequerimiento:', error.message);
    return res.status(error.status || 500).json({
      error:  error.message || 'Error interno al crear el requerimiento.',
      campo:  error.campo   || undefined,
    });
  }
};

/**
 * GET /api/v1/compras/proyectos/:idProyecto/requerimientos
 * Lista los requerimientos de un proyecto.
 * RBAC: todos los roles con acceso a compras.
 */
const listarRequerimientos = async (req, res) => {
  try {
    const { idProyecto } = req.params;
    const { estado }     = req.query;

    const requerimientos = await comprasService.listarRequerimientos(idProyecto, { estado });
    return res.status(200).json({ data: requerimientos, total: requerimientos.length });
  } catch (error) {
    console.error('[compras] listarRequerimientos:', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

/**
 * GET /api/v1/compras/requerimientos/:id
 * Detalle de un requerimiento específico.
 */
const obtenerRequerimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const req_   = await comprasService.obtenerRequerimiento(id);
    if (!req_) {
      return res.status(404).json({ error: 'Requerimiento no encontrado.' });
    }
    return res.status(200).json({ data: req_ });
  } catch (error) {
    console.error('[compras] obtenerRequerimiento:', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

/**
 * PUT /api/v1/compras/requerimientos/:id/aprobar
 * Aprueba un requerimiento.
 * RBAC: Admin, Presidente/Gerente.
 */
const aprobarRequerimiento = async (req, res) => {
  try {
    const { id }   = req.params;
    const idAprobador = req.user.id;

    const actualizado = await comprasService.aprobarRequerimiento(id, idAprobador);
    return res.status(200).json({
      message: 'Requerimiento aprobado correctamente.',
      data:    actualizado,
    });
  } catch (error) {
    console.error('[compras] aprobarRequerimiento:', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

/**
 * PUT /api/v1/compras/requerimientos/:id/rechazar
 * Rechaza un requerimiento con comentario obligatorio.
 * RBAC: Admin, Presidente/Gerente.
 */
const rechazarRequerimiento = async (req, res) => {
  try {
    const { id }               = req.params;
    const idAprobador          = req.user.id;
    const { comentarioRechazo } = req.body;

    const actualizado = await comprasService.rechazarRequerimiento(id, idAprobador, comentarioRechazo);
    return res.status(200).json({
      message: 'Requerimiento rechazado.',
      data:    actualizado,
    });
  } catch (error) {
    console.error('[compras] rechazarRequerimiento:', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

/**
 * GET /api/v1/compras/bandeja-gerencial
 * Retorna los requerimientos EN_REVISION para la bandeja gerencial.
 * RBAC: Presidente/Gerente, Admin.
 */
const bandejaGerencial = async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit  || '50', 10);
    const offset = parseInt(req.query.offset || '0',  10);

    const resultado = await obtenerBandejaGerencial({ limit, offset });
    return res.status(200).json({
      data:   resultado.requerimientos,
      total:  resultado.total,
      limit:  resultado.limit,
      offset: resultado.offset,
    });
  } catch (error) {
    console.error('[compras] bandejaGerencial:', error.message);
    return res.status(500).json({ error: 'Error al obtener la bandeja gerencial.' });
  }
};

module.exports = {
  crearRequerimiento,
  listarRequerimientos,
  obtenerRequerimiento,
  aprobarRequerimiento,
  rechazarRequerimiento,
  bandejaGerencial,
};
