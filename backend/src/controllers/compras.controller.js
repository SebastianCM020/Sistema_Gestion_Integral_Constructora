// ─────────────────────────────────────────────────────────────────────────────
// compras.controller.js — Sprint 6: Controlador de Requerimientos de Compra
//
// Responsabilidad única: traducir HTTP ↔ dominio.
// Toda la lógica de negocio vive en compras.service.js.
// ─────────────────────────────────────────────────────────────────────────────

const comprasService       = require('../services/compras.service');
const { obtenerBandejaGerencial } = require('../services/notification.service');
const prisma = require('../utils/prisma');
const { ROLES } = require('../middlewares/auth.middleware');

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

/**
 * GET /api/v1/compras/notificaciones
 * Obtiene notificaciones de requerimientos (para Gerente: creados; para Residente: aprobados/rechazados).
 */
const obtenerNotificaciones = async (req, res) => {
  try {
    const rol = req.user.rol;
    const userId = req.user.id;

    if (rol === ROLES.ADMIN || rol === ROLES.PRESIDENTE) {
      // Para administradores y gerentes: requerimientos en revisión
      const pendientes = await prisma.requerimientoCompra.findMany({
        where: { estado: 'EN_REVISION' },
        include: {
          proyecto: { select: { nombre: true, codigo: true } },
          solicitante: { select: { nombre: true, apellido: true } }
        },
        orderBy: { fechaSolicitud: 'desc' },
        take: 10
      });
      const notifications = pendientes.map(r => ({
        id: r.id,
        tipo: 'CREADO',
        titulo: 'Nuevo requerimiento',
        mensaje: `${r.solicitante.nombre} solicitó compra para ${r.proyecto.codigo}`,
        fecha: r.fechaSolicitud,
        requerimiento: r
      }));
      return res.status(200).json({ data: notifications });
    } else if (rol === ROLES.RESIDENTE || rol === ROLES.AUXILIAR) {
      // Para residentes y auxiliares: sus requerimientos que fueron aprobados o rechazados recientemente
      const recientes = await prisma.requerimientoCompra.findMany({
        where: {
          idSolicitante: userId,
          estado: { in: ['APROBADO', 'RECHAZADO'] }
        },
        include: {
          proyecto: { select: { nombre: true, codigo: true } },
          aprobador: { select: { nombre: true, apellido: true } }
        },
        orderBy: { fechaAprobacion: 'desc' },
        take: 10
      });
      const notifications = recientes.map(r => ({
        id: r.id,
        tipo: r.estado,
        titulo: r.estado === 'APROBADO' ? 'Requerimiento Aprobado' : 'Requerimiento Rechazado',
        mensaje: `Tu solicitud para ${r.proyecto.codigo} fue ${r.estado.toLowerCase()}`,
        fecha: r.fechaAprobacion || r.createdAt,
        requerimiento: r
      }));
      return res.status(200).json({ data: notifications });
    } else {
      return res.status(200).json({ data: [] });
    }
  } catch (error) {
    console.error('[compras] obtenerNotificaciones:', error.message);
    return res.status(500).json({ error: 'Error al obtener notificaciones.' });
  }
};

module.exports = {
  crearRequerimiento,
  listarRequerimientos,
  obtenerRequerimiento,
  aprobarRequerimiento,
  rechazarRequerimiento,
  bandejaGerencial,
  obtenerNotificaciones,
};
