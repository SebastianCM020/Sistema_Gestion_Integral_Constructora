// ─────────────────────────────────────────────────────────────────────────────
// materiales.service.js — HU-02: Catálogo de Materiales e Insumos
// Contiene toda la lógica de acceso a datos (Prisma) para el módulo de materiales.
// ─────────────────────────────────────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Lista todos los materiales activos con filtro opcional por categoría y búsqueda.
 * CA: CRUD funcional con búsqueda por categorías.
 *
 * @param {object} filtros
 * @param {string} [filtros.categoria]  - Filtro exacto por categoría
 * @param {string} [filtros.busqueda]   - Búsqueda parcial en nombre o código
 * @param {boolean} [filtros.soloActivos=true]
 * @returns {Promise<Material[]>}
 */
const listarMateriales = async ({ categoria, busqueda, soloActivos = true } = {}) => {
  const where = {};

  if (soloActivos) {
    where.activo = true;
  }

  if (categoria && categoria.trim()) {
    where.categoria = {
      equals: categoria.trim(),
      mode: 'insensitive',
    };
  }

  if (busqueda && busqueda.trim()) {
    where.OR = [
      { nombre:   { contains: busqueda.trim(), mode: 'insensitive' } },
      { codigo:   { contains: busqueda.trim(), mode: 'insensitive' } },
      { categoria:{ contains: busqueda.trim(), mode: 'insensitive' } },
    ];
  }

  return prisma.material.findMany({
    where,
    orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    select: {
      id: true, codigo: true, nombre: true,
      categoria: true, unidad: true, descripcion: true,
      activo: true, createdAt: true, updatedAt: true,
    },
  });
};

/**
 * Retorna las categorías únicas de materiales (para el select del frontend).
 * @returns {Promise<string[]>}
 */
const listarCategorias = async () => {
  const resultados = await prisma.material.findMany({
    where: { activo: true },
    select: { categoria: true },
    distinct: ['categoria'],
    orderBy: { categoria: 'asc' },
  });
  return resultados.map((r) => r.categoria);
};

/**
 * Obtiene un material por su ID.
 * @param {string} id - UUID del material
 */
const obtenerMaterialPorId = async (id) => {
  return prisma.material.findUnique({
    where: { id },
    select: {
      id: true, codigo: true, nombre: true,
      categoria: true, unidad: true, descripcion: true,
      activo: true, createdAt: true, updatedAt: true,
    },
  });
};

/**
 * Crea un nuevo material en el catálogo.
 * @param {object} datos
 */
const crearMaterial = async ({ codigo, nombre, categoria, unidad, descripcion }) => {
  // Validar unicidad del código antes de intentar insertar
  const existente = await prisma.material.findUnique({ where: { codigo } });
  if (existente) {
    const error = new Error(`Ya existe un material con el código "${codigo}".`);
    error.status = 409;
    throw error;
  }

  return prisma.material.create({
    data: { codigo, nombre, categoria, unidad, descripcion },
    select: {
      id: true, codigo: true, nombre: true,
      categoria: true, unidad: true, descripcion: true,
      activo: true, createdAt: true,
    },
  });
};

/**
 * Actualiza un material existente.
 * @param {string} id - UUID del material
 * @param {object} datos - Campos a actualizar
 */
const actualizarMaterial = async (id, { nombre, categoria, unidad, descripcion, activo }) => {
  // Verificar existencia
  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) {
    const error = new Error('Material no encontrado.');
    error.status = 404;
    throw error;
  }

  return prisma.material.update({
    where: { id },
    data: {
      ...(nombre      !== undefined && { nombre }),
      ...(categoria   !== undefined && { categoria }),
      ...(unidad      !== undefined && { unidad }),
      ...(descripcion !== undefined && { descripcion }),
      ...(activo      !== undefined && { activo }),
    },
    select: {
      id: true, codigo: true, nombre: true,
      categoria: true, unidad: true, descripcion: true,
      activo: true, updatedAt: true,
    },
  });
};

/**
 * Eliminación lógica (soft delete): desactiva el material sin borrarlo.
 * Preserva la integridad de movimientos e inventario histórico.
 * @param {string} id - UUID del material
 */
const eliminarMaterial = async (id) => {
  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) {
    const error = new Error('Material no encontrado.');
    error.status = 404;
    throw error;
  }
  if (!material.activo) {
    const error = new Error('El material ya se encuentra inactivo.');
    error.status = 409;
    throw error;
  }

  return prisma.material.update({
    where: { id },
    data: { activo: false },
    select: { id: true, nombre: true, activo: true },
  });
};

module.exports = {
  listarMateriales,
  listarCategorias,
  obtenerMaterialPorId,
  crearMaterial,
  actualizarMaterial,
  eliminarMaterial,
};
