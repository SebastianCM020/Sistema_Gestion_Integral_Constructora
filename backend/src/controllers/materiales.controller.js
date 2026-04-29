// ─────────────────────────────────────────────────────────────────────────────
// materiales.controller.js — HU-02: CRUD de Catálogo de Materiales
// Delega toda la lógica al service; solo maneja HTTP req/res.
// ─────────────────────────────────────────────────────────────────────────────

const materialesService = require('../services/materiales.service');

/**
 * GET /api/v1/materiales
 * Lista materiales con filtros opcionales: ?categoria=&busqueda=&soloActivos=
 */
const listarMateriales = async (req, res) => {
  try {
    const { categoria, busqueda, soloActivos } = req.query;
    const materiales = await materialesService.listarMateriales({
      categoria,
      busqueda,
      soloActivos: soloActivos === 'false' ? false : true,
    });
    return res.status(200).json({ data: materiales, total: materiales.length });
  } catch (error) {
    console.error('[materiales] listarMateriales:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

/**
 * GET /api/v1/materiales/categorias
 * Lista las categorías únicas para poblar el selector del frontend.
 */
const listarCategorias = async (_req, res) => {
  try {
    const categorias = await materialesService.listarCategorias();
    return res.status(200).json({ data: categorias });
  } catch (error) {
    console.error('[materiales] listarCategorias:', error);
    return res.status(500).json({ error: 'Error obteniendo categorías' });
  }
};

/**
 * GET /api/v1/materiales/:id
 * Obtiene un material por UUID.
 */
const obtenerMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await materialesService.obtenerMaterialPorId(id);
    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado.' });
    }
    return res.status(200).json({ data: material });
  } catch (error) {
    console.error('[materiales] obtenerMaterial:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

/**
 * POST /api/v1/materiales
 * Crea un nuevo material.
 * Body: { codigo, nombre, categoria, unidad, descripcion? }
 */
const crearMaterial = async (req, res) => {
  try {
    const { codigo, nombre, categoria, unidad, descripcion } = req.body;

    // Validación de campos obligatorios
    if (!codigo || !nombre || !categoria || !unidad) {
      return res.status(400).json({
        error: 'Los campos codigo, nombre, categoria y unidad son obligatorios.',
      });
    }

    const nuevo = await materialesService.crearMaterial({ codigo, nombre, categoria, unidad, descripcion });
    return res.status(201).json({
      message: 'Material creado correctamente.',
      data: nuevo,
    });
  } catch (error) {
    console.error('[materiales] crearMaterial:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

/**
 * PUT /api/v1/materiales/:id
 * Actualiza los datos de un material existente.
 * Body: { nombre?, categoria?, unidad?, descripcion?, activo? }
 */
const actualizarMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, unidad, descripcion, activo } = req.body;

    const actualizado = await materialesService.actualizarMaterial(id, {
      nombre, categoria, unidad, descripcion, activo,
    });

    return res.status(200).json({
      message: 'Material actualizado correctamente.',
      data: actualizado,
    });
  } catch (error) {
    console.error('[materiales] actualizarMaterial:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

/**
 * DELETE /api/v1/materiales/:id
 * Soft delete: desactiva el material sin borrar registros históricos.
 */
const eliminarMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await materialesService.eliminarMaterial(id);
    return res.status(200).json({
      message: 'Material desactivado correctamente.',
      data: resultado,
    });
  } catch (error) {
    console.error('[materiales] eliminarMaterial:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Error interno' });
  }
};

module.exports = {
  listarMateriales,
  listarCategorias,
  obtenerMaterial,
  crearMaterial,
  actualizarMaterial,
  eliminarMaterial,
};
