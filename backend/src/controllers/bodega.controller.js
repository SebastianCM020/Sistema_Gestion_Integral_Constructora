// ─────────────────────────────────────────────────────────────────────────────
// bodega.controller.js — HU-03: Registro de Entrada de Materiales
// Rol requerido: Bodeguero (verificado en la capa de rutas)
// ─────────────────────────────────────────────────────────────────────────────

const bodegaService = require('../services/bodega.service');

/**
 * POST /api/v1/bodega/proyectos/:idProyecto/movimientos
 * Registra una entrada (o salida/ajuste) de material y actualiza el stock.
 *
 * Body: { idMaterial, tipoMovimiento, cantidad, observacion? }
 *
 * CA: El sistema permite ingresar stock inicial y actualiza el total disponible del material.
 */
const registrarMovimiento = async (req, res) => {
  try {
    const { idProyecto } = req.params;
    const { idMaterial, tipoMovimiento, cantidad, observacion } = req.body;
    const idUsuario = req.user.id; // Bodeguero autenticado (inyectado por requireAuth)

    // Validación de campos obligatorios
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
      data: movimiento,
    });
  } catch (error) {
    console.error('[bodega] registrarMovimiento:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

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

/**
 * GET /api/v1/bodega/proyectos/:idProyecto/inventario
 * Stock actual de todos los materiales de un proyecto.
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
  registrarMovimiento,
  listarMovimientos,
  obtenerInventario,
};
