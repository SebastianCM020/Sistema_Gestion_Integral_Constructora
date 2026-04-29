// ─────────────────────────────────────────────────────────────────────────────
// bodega.service.js — HU-03: Registro de entradas de materiales
// Usa transacciones Prisma para garantizar atomicidad:
// SIEMPRE que se registra un movimiento, se actualiza InventarioProyecto.
// ─────────────────────────────────────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TIPOS_VALIDOS = ['ENTRADA', 'SALIDA', 'AJUSTE'];

/**
 * Registra una entrada de materiales y actualiza el stock disponible.
 * Operación atómica: si algo falla, NINGÚN cambio persiste.
 *
 * CA: El sistema permite ingresar stock inicial y actualiza el total disponible.
 *
 * @param {object} datos
 * @param {string} datos.idMaterial   - UUID del material
 * @param {string} datos.idProyecto   - UUID del proyecto al que pertenece el stock
 * @param {string} datos.idUsuario    - UUID del bodeguero autenticado
 * @param {string} datos.tipoMovimiento - 'ENTRADA' | 'SALIDA' | 'AJUSTE'
 * @param {number} datos.cantidad     - Cantidad a registrar (siempre positiva)
 * @param {string} [datos.observacion]
 */
const registrarMovimiento = async ({
  idMaterial,
  idProyecto,
  idUsuario,
  tipoMovimiento,
  cantidad,
  observacion,
}) => {
  // ── Validaciones de negocio ──────────────────────────────────────────────
  if (!TIPOS_VALIDOS.includes(tipoMovimiento)) {
    const error = new Error(`tipoMovimiento inválido. Use: ${TIPOS_VALIDOS.join(' | ')}`);
    error.status = 400;
    throw error;
  }

  const cantidadNum = parseFloat(cantidad);
  if (isNaN(cantidadNum) || cantidadNum <= 0) {
    const error = new Error('La cantidad debe ser un número positivo mayor a 0.');
    error.status = 400;
    throw error;
  }

  // ── Verificar que el material exista y esté activo ───────────────────────
  const material = await prisma.material.findUnique({ where: { id: idMaterial } });
  if (!material || !material.activo) {
    const error = new Error('Material no encontrado o inactivo.');
    error.status = 404;
    throw error;
  }

  // ── Transacción atómica ──────────────────────────────────────────────────
  return prisma.$transaction(async (tx) => {
    // 1. Obtener el stock actual (o 0 si nunca se ha registrado en este proyecto)
    const inventarioActual = await tx.inventarioProyecto.findUnique({
      where: { idMaterial_idProyecto: { idMaterial, idProyecto } },
    });

    const cantidadAnterior = inventarioActual
      ? parseFloat(inventarioActual.cantidadDisponible)
      : 0;

    // 2. Calcular el nuevo stock según el tipo de movimiento
    let cantidadResultante;
    if (tipoMovimiento === 'ENTRADA') {
      cantidadResultante = cantidadAnterior + cantidadNum;
    } else if (tipoMovimiento === 'SALIDA') {
      cantidadResultante = cantidadAnterior - cantidadNum;
      if (cantidadResultante < 0) {
        const error = new Error(
          `Stock insuficiente. Disponible: ${cantidadAnterior}, solicitado: ${cantidadNum}.`
        );
        error.status = 422;
        throw error;
      }
    } else {
      // AJUSTE: reemplaza el valor directamente
      cantidadResultante = cantidadNum;
    }

    // 3. Registrar el movimiento (log inmutable tipo libro contable)
    const movimiento = await tx.movimientoInventario.create({
      data: {
        idMaterial,
        idProyecto,
        idUsuario,
        tipoMovimiento,
        cantidad:           cantidadNum,
        cantidadAnterior,
        cantidadResultante,
        observacion,
      },
      include: {
        material: { select: { nombre: true, unidad: true, codigo: true } },
        proyecto: { select: { nombre: true, codigo: true } },
        usuario:  { select: { nombre: true, apellido: true } },
      },
    });

    // 4. Upsert del inventario: crea si no existe, actualiza si ya existe
    await tx.inventarioProyecto.upsert({
      where: { idMaterial_idProyecto: { idMaterial, idProyecto } },
      create: {
        idMaterial,
        idProyecto,
        cantidadDisponible: cantidadResultante,
      },
      update: {
        cantidadDisponible: cantidadResultante,
        // ultimaActualizacion se actualiza automáticamente por @updatedAt
      },
    });

    return movimiento;
  });
};

/**
 * Lista el historial de movimientos de un proyecto con filtros opcionales.
 * @param {string} idProyecto
 * @param {object} filtros
 * @param {string} [filtros.idMaterial]
 * @param {string} [filtros.tipoMovimiento]
 * @param {number} [filtros.page=1]
 * @param {number} [filtros.limit=20]
 */
const listarMovimientos = async (idProyecto, { idMaterial, tipoMovimiento, page = 1, limit = 20 } = {}) => {
  const where = { idProyecto };

  if (idMaterial)     where.idMaterial     = idMaterial;
  if (tipoMovimiento) where.tipoMovimiento = tipoMovimiento;

  const skip = (page - 1) * limit;

  const [movimientos, total] = await prisma.$transaction([
    prisma.movimientoInventario.findMany({
      where,
      skip,
      take: limit,
      orderBy: { fechaMovimiento: 'desc' },
      include: {
        material: { select: { nombre: true, unidad: true, codigo: true } },
        usuario:  { select: { nombre: true, apellido: true } },
      },
    }),
    prisma.movimientoInventario.count({ where }),
  ]);

  return {
    data: movimientos,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Obtiene el inventario actual de un proyecto (stock disponible por material).
 * @param {string} idProyecto
 */
const obtenerInventarioProyecto = async (idProyecto) => {
  return prisma.inventarioProyecto.findMany({
    where: { idProyecto },
    include: {
      material: {
        select: { id: true, nombre: true, codigo: true, categoria: true, unidad: true },
      },
    },
    orderBy: { material: { nombre: 'asc' } },
  });
};

module.exports = {
  registrarMovimiento,
  listarMovimientos,
  obtenerInventarioProyecto,
};
