// ─────────────────────────────────────────────────────────────────────────────
// bodega.routes.js — HU-03: Rutas del módulo de Bodega
// Acceso: Bodeguero (escritura), Admin/Residente (lectura del inventario)
// ─────────────────────────────────────────────────────────────────────────────

const express  = require('express');
const router   = express.Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');
const bodegaController = require('../controllers/bodega.controller');

// Bodeguero es quien registra movimientos; Admin puede también
const canWrite = [requireAuth, requireRole([ROLES.ADMIN, ROLES.BODEGUERO])];

// Lectura del inventario: más roles (Residente necesita saber el stock)
const canRead  = [requireAuth, requireRole([
  ROLES.ADMIN, ROLES.BODEGUERO, ROLES.RESIDENTE, ROLES.PRESIDENTE, ROLES.CONTADOR,
])];

/**
 * POST /api/v1/bodega/proyectos/:idProyecto/movimientos
 * Registra una entrada/salida/ajuste de material.
 * Body: { idMaterial, tipoMovimiento, cantidad, observacion? }
 *
 * CA HU-03: El sistema permite ingresar stock inicial y actualiza el total disponible.
 */
router.post(
  '/proyectos/:idProyecto/movimientos',
  ...canWrite,
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
  bodegaController.listarMovimientos
);

/**
 * GET /api/v1/bodega/proyectos/:idProyecto/inventario
 * Stock actual de todos los materiales asignados al proyecto.
 */
router.get(
  '/proyectos/:idProyecto/inventario',
  ...canRead,
  bodegaController.obtenerInventario
);

module.exports = router;
