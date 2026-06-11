// ─────────────────────────────────────────────────────────────────────────────
// bodega.routes.js — Sprint 8: Rutas del módulo de Bodega e Inventario
//
// Acceso RBAC:
//   - Bodeguero: lectura y escritura de movimientos/recepciones.
//   - Admin: acceso completo.
//   - Residente, Presidente, Contador: lectura del inventario.
//
// Rutas nuevas Sprint 8:
//   POST /proyectos/:idProyecto/requerimientos/:idRequerimiento/recepcionar
//   GET  /proyectos/:idProyecto/requerimientos-aprobados
// ─────────────────────────────────────────────────────────────────────────────

const express  = require('express');
const router   = express.Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');
const { requireProjectAccess } = require('../middlewares/projectAccess.middleware');
const bodegaController = require('../controllers/bodega.controller');

// Bodeguero y Admin pueden registrar movimientos y recepciones
const canWrite = [requireAuth, requireRole([ROLES.ADMIN, ROLES.BODEGUERO])];

// Lectura: roles que necesitan consultar stock e inventario
const canRead  = [requireAuth, requireRole([
  ROLES.ADMIN, ROLES.BODEGUERO, ROLES.RESIDENTE, ROLES.PRESIDENTE, ROLES.CONTADOR,
])];

// ── Sprint 8 — HU-S8-1 / HU-S8-2: Requerimientos aprobados para bodeguero ────

/**
 * GET /api/v1/bodega/proyectos/:idProyecto/requerimientos-aprobados
 *
 * Lista los requerimientos en estado APROBADO para el proyecto.
 * CA HU-S8-1: Solo se muestran requerimientos APROBADOS filtrados por proyecto autorizado.
 */
router.get(
  '/proyectos/:idProyecto/requerimientos-aprobados',
  ...canRead,
  requireProjectAccess,
  bodegaController.listarRequerimientosAprobados
);

/**
 * POST /api/v1/bodega/proyectos/:idProyecto/requerimientos/:idRequerimiento/recepcionar
 *
 * Recepciona materiales de un requerimiento APROBADO (transacción atómica).
 * Body: { detallesRecepcion: [{idMaterial, cantidadRecibida, observacion?}] }
 *
 * CA HU-S8-2:
 *   - Si requerimiento NO es APROBADO → 422 con alerta clara.
 *   - Si cantidad excede la solicitada → 422 con alerta clara.
 *   - Si todo es válido → 201 con movimientos generados.
 */
router.post(
  '/proyectos/:idProyecto/requerimientos/:idRequerimiento/recepcionar',
  ...canWrite,
  requireProjectAccess,
  bodegaController.recepcionarMateriales
);

// ── Sprint 3 (originales) — Mantenidos para compatibilidad ───────────────────

/**
 * POST /api/v1/bodega/proyectos/:idProyecto/movimientos
 * Registra una entrada/salida/ajuste libre de material.
 * Body: { idMaterial, tipoMovimiento, cantidad, observacion? }
 */
router.post(
  '/proyectos/:idProyecto/movimientos',
  ...canWrite,
  requireProjectAccess,
  bodegaController.registrarMovimiento
);

/**
 * GET /api/v1/bodega/proyectos/:idProyecto/movimientos
 * Historial de movimientos de un proyecto.
 * Query: ?idMaterial=&tipoMovimiento=ENTRADA|SALIDA|AJUSTE&page=1&limit=20
 */
router.get(
  '/proyectos/:idProyecto/movimientos',
  ...canRead,
  requireProjectAccess,
  bodegaController.listarMovimientos
);

/**
 * GET /api/v1/bodega/proyectos/:idProyecto/inventario
 * Stock actual con desglose de movimientos y saldo por material.
 * CA HU-S8-4: Incluye desglose (entradas/salidas/ajustes) y diferencias pendientes.
 */
router.get(
  '/proyectos/:idProyecto/inventario',
  ...canRead,
  requireProjectAccess,
  bodegaController.obtenerInventario
);

module.exports = router;
