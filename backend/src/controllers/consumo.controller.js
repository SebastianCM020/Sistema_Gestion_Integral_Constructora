// ─────────────────────────────────────────────────────────────────────────────
// consumo.controller.js — Sprint 9: Módulo de Consumo en Obra
//
// HU-S9-1: Solo el Residente accede — materiales del proyecto autorizado y vigente.
// HU-S9-2: Cada consumo genera un MovimientoInventario tipo SALIDA.
// HU-S9-3: Validaciones: stock insuficiente, proyecto ajeno, concurrencia.
// HU-S9-4: Idempotencia resuelta en el CLIENTE (IndexedDB + SyncManager).
//           El servidor no persiste ninguna clave de idempotencia en la BD;
//           simplemente responde 201 por cada petición válida recibida.
//
// Responsabilidad única: traducir HTTP ↔ dominio.
// Toda la lógica de negocio vive en consumo.service.js.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const consumoService = require('../services/consumo.service');

// ─── HU-S9-2 / HU-S9-3: Registrar consumo en obra ────────────────────────────

/**
 * POST /api/v1/consumo/proyectos/:idProyecto/consumir
 *
 * Registra el consumo de un material en obra de forma atómica.
 *
 * Body: { idMaterial, cantidad, observacion? }
 *
 * Códigos de respuesta:
 *   201 — Consumo registrado correctamente (movimiento SALIDA creado).
 *   400 — Datos de entrada inválidos.
 *   403 — Proyecto ajeno o asignación no vigente.
 *   404 — Proyecto o material no encontrado.
 *   409 — Conflicto de concurrencia.
 *   422 — Stock insuficiente o proyecto inactivo.
 */
const registrarConsumo = async (req, res) => {
  try {
    const { idProyecto } = req.params;
    const { idMaterial, cantidad, observacion } = req.body;
    const idUsuario = req.user.id;
    const ipOrigen  = req.headers['x-forwarded-for']?.split(',')[0].trim()
      || req.socket?.remoteAddress
      || req.ip
      || null;

    if (!idMaterial || cantidad === undefined) {
      return res.status(400).json({
        error: 'Los campos idMaterial y cantidad son obligatorios.',
      });
    }

    const resultado = await consumoService.registrarConsumo({
      idProyecto,
      idMaterial,
      idUsuario,
      cantidad,
      observacion,
      ipOrigen,
    });

    return res.status(201).json({
      message:       `Consumo registrado correctamente. Stock actualizado: ${resultado.stockActual} ${resultado.movimiento.material?.unidad ?? ''}.`,
      data:          resultado.movimiento,
      stockAnterior: resultado.stockAnterior,
      stockActual:   resultado.stockActual,
    });

  } catch (error) {
    console.error('[consumo] registrarConsumo:', error.message);
    return res.status(error.status || 500).json({
      error:   error.message  || 'Error interno al procesar el consumo.',
      codigo:  error.codigo   || undefined,
      detalle: error.detalle  || undefined,
    });
  }
};

// ─── HU-S9-1: Materiales disponibles para el proyecto del residente ───────────

/**
 * GET /api/v1/consumo/proyectos/:idProyecto/materiales-disponibles
 *
 * Lista los materiales activos con stock > 0 del proyecto del residente.
 */
const obtenerMaterialesDisponibles = async (req, res) => {
  try {
    const { idProyecto } = req.params;
    const idUsuario = req.user.id;

    const materiales = await consumoService.obtenerMaterialesDisponibles(idProyecto, idUsuario);

    return res.status(200).json({
      data:  materiales,
      total: materiales.length,
    });
  } catch (error) {
    console.error('[consumo] obtenerMaterialesDisponibles:', error.message);
    return res.status(error.status || 500).json({
      error:  error.message  || 'Error interno al obtener materiales.',
      codigo: error.codigo   || undefined,
    });
  }
};

// ─── Historial de consumos del residente en un proyecto ───────────────────────

/**
 * GET /api/v1/consumo/proyectos/:idProyecto/historial
 * Query params: ?idMaterial=&idUsuario=&page=1&limit=20
 */
const listarConsumos = async (req, res) => {
  try {
    const { idProyecto } = req.params;
    const { idMaterial, idUsuario, page, limit } = req.query;

    const resultado = await consumoService.listarConsumos(idProyecto, {
      idMaterial,
      idUsuario,
      page:  page  ? parseInt(page,  10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('[consumo] listarConsumos:', error.message);
    return res.status(error.status || 500).json({
      error: error.message || 'Error interno al listar consumos.',
    });
  }
};

module.exports = {
  registrarConsumo,
  obtenerMaterialesDisponibles,
  listarConsumos,
};
