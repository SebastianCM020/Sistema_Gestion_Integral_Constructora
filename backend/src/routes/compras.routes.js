// ─────────────────────────────────────────────────────────────────────────────
// compras.routes.js — Sprint 6: Rutas de Requerimientos de Compra
//
// RBAC aplicado por endpoint:
//   - Lectura:  Admin, Residente, Presidente/Gerente, Contador, Bodeguero
//   - Creación: Admin, Residente, Presidente/Gerente
//   - Aprobación/Rechazo: Admin, Presidente/Gerente
//   - Bandeja gerencial:  Admin, Presidente/Gerente
//
// Decisión: La bandeja gerencial va en este router (/compras/bandeja-gerencial)
// para mantener la cohesión del módulo. El prefijo /api/v1/compras agrupa toda
// la funcionalidad de compras/requerimientos en un solo dominio.
// ─────────────────────────────────────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');
const comprasController = require('../controllers/compras.controller');

// ── Grupos de roles ────────────────────────────────────────────────────────────
/** Roles que pueden leer requerimientos */
const canRead = [requireAuth, requireRole([
  ROLES.ADMIN, ROLES.RESIDENTE, ROLES.PRESIDENTE, ROLES.CONTADOR, ROLES.BODEGUERO,
])];

/** Roles que pueden crear requerimientos */
const canCreate = [requireAuth, requireRole([
  ROLES.ADMIN, ROLES.RESIDENTE, ROLES.PRESIDENTE,
])];

/** Roles que pueden aprobar o rechazar requerimientos (gerencial) */
const canApprove = [requireAuth, requireRole([
  ROLES.ADMIN, ROLES.PRESIDENTE,
])];

// ── Bandeja Gerencial ─────────────────────────────────────────────────────────
/**
 * GET /api/v1/compras/bandeja-gerencial
 * Retorna los requerimientos en estado EN_REVISION para revisión gerencial.
 * CA: Presidente/Gerente ve requerimientos pendientes según RBAC.
 *
 * IMPORTANTE: Esta ruta va ANTES de las rutas parametrizadas para evitar
 * que Express trate "bandeja-gerencial" como un UUID de proyecto.
 */
router.get('/bandeja-gerencial', ...canApprove, comprasController.bandejaGerencial);

// ── Requerimientos por Proyecto ───────────────────────────────────────────────
/**
 * GET /api/v1/compras/proyectos/:idProyecto/requerimientos
 * Lista los requerimientos de un proyecto.
 * Query: ?estado=EN_REVISION|APROBADO|RECHAZADO|RECIBIDO
 */
router.get(
  '/proyectos/:idProyecto/requerimientos',
  ...canRead,
  comprasController.listarRequerimientos
);

/**
 * POST /api/v1/compras/proyectos/:idProyecto/requerimientos
 * Crea un requerimiento.
 * Body: { justificacion, detalles: [{idMaterial, cantidadSolicitada}] }
 * CA: Estado inicial fijo EN_REVISION. Bloqueo si proyecto inactivo.
 */
router.post(
  '/proyectos/:idProyecto/requerimientos',
  ...canCreate,
  comprasController.crearRequerimiento
);

// ── Requerimiento individual ──────────────────────────────────────────────────
/**
 * GET /api/v1/compras/requerimientos/:id
 * Detalle de un requerimiento.
 */
router.get('/requerimientos/:id', ...canRead, comprasController.obtenerRequerimiento);

/**
 * PUT /api/v1/compras/requerimientos/:id/aprobar
 * Aprueba un requerimiento EN_REVISION.
 * RBAC: Admin y Presidente/Gerente.
 */
router.put('/requerimientos/:id/aprobar', ...canApprove, comprasController.aprobarRequerimiento);

/**
 * PUT /api/v1/compras/requerimientos/:id/rechazar
 * Rechaza un requerimiento EN_REVISION.
 * Body: { comentarioRechazo }
 * RBAC: Admin y Presidente/Gerente.
 */
router.put('/requerimientos/:id/rechazar', ...canApprove, comprasController.rechazarRequerimiento);

module.exports = router;
