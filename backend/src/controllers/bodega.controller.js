// ─────────────────────────────────────────────────────────────────────────────
// bodega.controller.js — Sprint 8: Módulo de Bodega e Inventario
//
// HU-S8-1: Interfaz del bodeguero — requerimientos APROBADOS + movimientos.
// HU-S8-2: Recepción transaccional vinculada a requerimiento.
// HU-S8-3: Bloqueos y alertas ante requerimientos no aprobados o exceso.
// HU-S8-4: Consulta de inventario con saldo, desglose y diferencias.
//
// Responsabilidad única: traducir HTTP ↔ dominio.
// Toda la lógica de negocio vive en bodega.service.js.
// ─────────────────────────────────────────────────────────────────────────────

const bodegaService = require('../services/bodega.service');

// ─── HU-S8-1 / HU-S8-2: Recepción vinculada a requerimiento ─────────────────

/**
 * POST /api/v1/bodega/proyectos/:idProyecto/requerimientos/:idRequerimiento/recepcionar
 *
 * Recepciona materiales de un requerimiento APROBADO de forma atómica.
 * Body: { detallesRecepcion: [{idMaterial, cantidadRecibida, observacion?}] }
 *
 * CA HU-S8-2:
 *   - 422 si el requerimiento NO está APROBADO.
 *   - 422 si la cantidad supera la solicitada.
 *   - 201 con los movimientos generados si todo es válido.
 */
const recepcionarMateriales = async (req, res) => {
  try {
    const { idProyecto, idRequerimiento } = req.params;
    const { detallesRecepcion }           = req.body;
    const idUsuario = req.user.id;
    const ipOrigen  = req.headers['x-forwarded-for']?.split(',')[0].trim()
      || req.socket?.remoteAddress
      || req.ip
      || null;

    if (!idRequerimiento) {
      return res.status(400).json({ error: 'El parámetro idRequerimiento es obligatorio.' });
    }

    const resultado = await bodegaService.recepcionarMateriales({
      idRequerimiento,
      idProyecto,
      idUsuario,
      detallesRecepcion,
      ipOrigen,
    });

    return res.status(201).json({
      message: `Recepción registrada correctamente. Se generaron ${resultado.stockActualizado} movimiento(s) de ENTRADA.`,
      data:    resultado,
    });
  } catch (error) {
    console.error('[bodega] recepcionarMateriales:', error.message);
    return res.status(error.status || 500).json({
      error:   error.message  || 'Error interno al procesar la recepción.',
      codigo:  error.codigo   || undefined,
      detalle: error.detalle  || undefined,
    });
  }
};

// ─── HU-S8-1 (lista de requerimientos APROBADOS por proyecto) ────────────────

/**
 * GET /api/v1/bodega/proyectos/:idProyecto/requerimientos-aprobados
 *
 * Retorna los requerimientos en estado APROBADO para el proyecto indicado.
 * Filtrado por proyecto (acceso ya verificado por requireProjectAccess).
 *
 * CA HU-S8-1: La interfaz muestra exclusivamente los requerimientos APROBADOS
 *              filtrados por proyecto autorizado.
 */
const listarRequerimientosAprobados = async (req, res) => {
  try {
    const { idProyecto } = req.params;
    const requerimientos = await bodegaService.listarRequerimientosAprobados(idProyecto);
    return res.status(200).json({ data: requerimientos, total: requerimientos.length });
  } catch (error) {
    console.error('[bodega] listarRequerimientosAprobados:', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

// ─── HU-S8-1 (original): Movimiento libre ────────────────────────────────────

/**
 * POST /api/v1/bodega/proyectos/:idProyecto/movimientos
 * Registra una entrada/salida/ajuste libre de material.
 * Body: { idMaterial, tipoMovimiento, cantidad, observacion? }
 */
const registrarMovimiento = async (req, res) => {
  try {
    const { idProyecto } = req.params;
    const { idMaterial, tipoMovimiento, cantidad, observacion } = req.body;
    const idUsuario = req.user.id;

    if (!idMaterial || !tipoMovimiento || cantidad === undefined) {
      return res.status(400).json({
        error: 'Los campos idMaterial, tipoMovimiento y cantidad son obligatorios.',
      });
    }

    const movimiento = await bodegaService.registrarMovimiento({
      idMaterial,
      idProyecto,
      idUsuario,
      tipoMovimiento: tipoMovimiento.toUpperCase(),
      cantidad,
      observacion,
    });

    return res.status(201).json({
      message: `Movimiento de ${movimiento.tipoMovimiento} registrado correctamente.`,
      data:    movimiento,
    });
  } catch (error) {
    console.error('[bodega] registrarMovimiento:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

// ─── HU-S8-1 / HU-S8-4: Historial de movimientos ────────────────────────────

/**
 * GET /api/v1/bodega/proyectos/:idProyecto/movimientos
 * Historial de movimientos de un proyecto.
 * Query params: ?idMaterial=&tipoMovimiento=&page=&limit=
 */
const listarMovimientos = async (req, res) => {
  try {
    const { idProyecto } = req.params;
    const { idMaterial, tipoMovimiento, page, limit } = req.query;

    const resultado = await bodegaService.listarMovimientos(idProyecto, {
      idMaterial,
      tipoMovimiento: tipoMovimiento?.toUpperCase(),
      page:  page  ? parseInt(page,  10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('[bodega] listarMovimientos:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

// ─── HU-S8-4: Inventario con saldo y desglose ────────────────────────────────

/**
 * GET /api/v1/bodega/proyectos/:idProyecto/inventario
 *
 * Stock actual con desglose de entradas/salidas y diferencias pendientes.
 *
 * CA HU-S8-4:
 *   - Saldo correcto por material.
 *   - Desglose (entradas, salidas, ajustes).
 *   - Diferencia que refleja movimientos pendientes o última sincronización.
 */
const obtenerInventario = async (req, res) => {
  try {
    const { idProyecto } = req.params;
    const inventario = await bodegaService.obtenerInventarioProyecto(idProyecto);
    return res.status(200).json({ data: inventario, total: inventario.length });
  } catch (error) {
    console.error('[bodega] obtenerInventario:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

module.exports = {
  recepcionarMateriales,
  listarRequerimientosAprobados,
  registrarMovimiento,
  listarMovimientos,
  obtenerInventario,
};
