// ─────────────────────────────────────────────────────────────────────────────
// consumo.routes.js — Sprint 9: Rutas del módulo de Consumo en Obra
//
// RBAC Sprint 9:
//   - Residente: puede registrar consumos y consultar materiales disponibles.
//   - Admin, Presidente, Bodeguero, Contador: lectura del historial de consumos.
//   - El Residente NO puede acceder a proyectos ajenos (verificado por requireProjectAccess).
//
// Rutas Sprint 9:
//   POST  /proyectos/:idProyecto/consumir
//   GET   /proyectos/:idProyecto/materiales-disponibles
//   GET   /proyectos/:idProyecto/historial
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const express  = require('express');
const router   = express.Router();

const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');
const { requireProjectAccess }            = require('../middlewares/projectAccess.middleware');
const consumoController                   = require('../controllers/consumo.controller');

// Roles que pueden registrar consumos en obra
const canConsume = [
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.RESIDENTE]),
];

// Roles que pueden leer el historial de consumos
const canRead = [
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.RESIDENTE, ROLES.BODEGUERO, ROLES.PRESIDENTE, ROLES.CONTADOR]),
];

// ── HU-S9-1: Materiales disponibles para el residente ────────────────────────

/**
 * GET /api/v1/consumo/proyectos/:idProyecto/materiales-disponibles
 *
 * Lista los materiales activos con stock > 0 del proyecto autorizado.
 * CA HU-S9-1: Solo retorna materiales del proyecto asignado al residente.
 */
router.get(
  '/proyectos/:idProyecto/materiales-disponibles',
  ...canRead,
  requireProjectAccess,
  consumoController.obtenerMaterialesDisponibles
);

// ── HU-S9-2 / HU-S9-3: Registrar consumo ────────────────────────────────────

/**
 * POST /api/v1/consumo/proyectos/:idProyecto/consumir
 *
 * Registra el consumo de un material en obra (transacción atómica).
 * Body: { idMaterial, cantidad, observacion?, idempotencyKey? }
 *
 * CA HU-S9-2: Genera MovimientoInventario tipo SALIDA y descuenta stock.
 * CA HU-S9-3: Bloquea si stock insuficiente, proyecto ajeno o concurrencia.
 * CA HU-S9-4: idempotencyKey previene duplicados en sincronización offline.
 */
router.post(
  '/proyectos/:idProyecto/consumir',
  ...canConsume,
  requireProjectAccess,
  consumoController.registrarConsumo
);

// ── Historial de consumos ─────────────────────────────────────────────────────

/**
 * GET /api/v1/consumo/proyectos/:idProyecto/historial
 *
 * Historial de movimientos tipo SALIDA del proyecto.
 * Query: ?idMaterial=&idUsuario=&page=1&limit=20
 */
router.get(
  '/proyectos/:idProyecto/historial',
  ...canRead,
  requireProjectAccess,
  consumoController.listarConsumos
);

module.exports = router;
