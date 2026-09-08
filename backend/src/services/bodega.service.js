// ─────────────────────────────────────────────────────────────────────────────
// bodega.service.js — Sprint 8: Bodega, Recepción Transaccional e Inventario
//
// HU-S8-1: Registrar recepción de materiales vinculada a un RequerimientoCompra.
// HU-S8-2: Validaciones estrictas antes de procesar (estado APROBADO + exceso de cantidad).
// HU-S8-3: Consulta de inventario con desglose de movimientos y diferencias.
//
// Garantías transaccionales:
//   - recepcionarMateriales: UN solo prisma.$transaction que hace:
//       a) Verifica requerimiento APROBADO.
//       b) Valida que la cantidad no supere la solicitada.
//       c) Crea MovimientoInventario (tipo ENTRADA) por cada detalle.
//       d) Upsert en InventarioProyecto.
//       e) Registra en audit_log.
//     Ante cualquier fallo, Prisma hace rollback automático y el stock no cambia.
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require('../utils/prisma');

const TIPOS_VALIDOS = ['ENTRADA', 'SALIDA', 'AJUSTE'];

// ─── HU-S8-1 / HU-S8-2: Recepción transaccional vinculada a requerimiento ────

/**
 * Recepciona materiales de un requerimiento APROBADO de forma atómica.
 *
 * CA Sprint 8:
 *   ✓ El requerimiento debe estar en estado APROBADO — de lo contrario se aborta.
 *   ✓ La cantidad a recibir por detalle no puede superar la cantidadSolicitada.
 *   ✓ Se genera un MovimientoInventario tipo ENTRADA por cada detalle recibido.
 *   ✓ Se actualiza (o crea) el stock en InventarioProyecto.
 *   ✓ Se registra en audit_log dentro de la misma transacción.
 *   ✓ Si falla cualquier paso, rollback total — stock nunca cambia parcialmente.
 *
 * @param {object} datos
 * @param {string}   datos.idRequerimiento - UUID del RequerimientoCompra
 * @param {string}   datos.idProyecto      - UUID del proyecto
 * @param {string}   datos.idUsuario       - UUID del bodeguero autenticado
 * @param {Array}    datos.detallesRecepcion - [{idMaterial, cantidadRecibida, observacion?}]
 * @param {string}   [datos.ipOrigen]      - IP del cliente (para audit_log)
 * @returns {Promise<{requerimiento, movimientos, stockActualizado}>}
 */
const recepcionarMateriales = async ({
  idRequerimiento,
  idProyecto,
  idUsuario,
  detallesRecepcion,
  ipOrigen = null,
}) => {
  // ── Pre-validaciones fuera de la transacción (rápidas) ───────────────────

  if (!Array.isArray(detallesRecepcion) || detallesRecepcion.length === 0) {
    const err = new Error('Debe incluir al menos un detalle de recepción.');
    err.status = 400;
    throw err;
  }

  for (const [i, d] of detallesRecepcion.entries()) {
    const cant = parseFloat(d.cantidadRecibida);
    if (isNaN(cant) || cant <= 0) {
      const err = new Error(
        `detallesRecepcion[${i}].cantidadRecibida debe ser un número positivo. Recibido: "${d.cantidadRecibida}".`
      );
      err.status = 400;
      throw err;
    }
  }

  // ── Transacción atómica ──────────────────────────────────────────────────
  return prisma.$transaction(async (tx) => {

    // 1. Verificar que el requerimiento existe y está APROBADO (CA HU-S8-2)
    const requerimiento = await tx.requerimientoCompra.findUnique({
      where: { id: idRequerimiento },
      include: {
        detalles: {
          include: {
            material: { select: { id: true, nombre: true, codigo: true, activo: true } },
          },
        },
        proyecto: { select: { id: true, nombre: true, codigo: true } },
      },
    });

    if (!requerimiento) {
      const err = new Error('Requerimiento de compra no encontrado.');
      err.status = 404;
      throw err;
    }

    // CA HU-S8-2: Bloquear si NO está APROBADO
    if (requerimiento.estado !== 'APROBADO') {
      const err = new Error(
        `No se puede recepcionar materiales de un requerimiento en estado "${requerimiento.estado}". ` +
        'Solo se admiten recepciones de requerimientos en estado APROBADO.'
      );
      err.status = 422;
      err.codigo = 'REQUERIMIENTO_NO_APROBADO';
      throw err;
    }

    // Verificar que el requerimiento pertenece al proyecto indicado
    if (requerimiento.idProyecto !== idProyecto) {
      const err = new Error('El requerimiento no pertenece al proyecto indicado.');
      err.status = 403;
      throw err;
    }

    // 2. Construir mapa de detalles del requerimiento para validar cantidades
    const mapaDetalles = new Map(
      requerimiento.detalles.map((d) => [d.idMaterial, d])
    );

    // CA HU-S8-2: Validar que cantidad recibida no supera la solicitada
    for (const [i, rec] of detallesRecepcion.entries()) {
      const detalleReq = mapaDetalles.get(rec.idMaterial);
      if (!detalleReq) {
        const err = new Error(
          `detallesRecepcion[${i}]: El material "${rec.idMaterial}" no está en los detalles del requerimiento.`
        );
        err.status = 400;
        throw err;
      }

      const cantSolicitada = parseFloat(detalleReq.cantidadSolicitada);
      const cantRecibida   = parseFloat(rec.cantidadRecibida);
      const cantPrevRecibida = parseFloat(detalleReq.cantidadRecibida ?? 0);
      const cantPendiente  = cantSolicitada - cantPrevRecibida;

      if (cantRecibida > cantPendiente) {
        const err = new Error(
          `Exceso en recepción para "${detalleReq.material.nombre}": ` +
          `cantidad pendiente de recibir es ${cantPendiente} ${detalleReq.material.codigo}, ` +
          `pero se intenta recibir ${cantRecibida}. La operación ha sido abortada.`
        );
        err.status = 422;
        err.codigo = 'CANTIDAD_EXCEDE_REQUERIMIENTO';
        err.detalle = {
          idMaterial:       rec.idMaterial,
          nombreMaterial:   detalleReq.material.nombre,
          cantidadSolicitada,
          cantidadYaRecibida: cantPrevRecibida,
          cantidadPendiente: cantPendiente,
          cantidadIntentada: cantRecibida,
        };
        throw err;
      }
    }

    // 3. Procesar cada detalle: crear MovimientoInventario + upsert stock
    const movimientos = [];

    for (const rec of detallesRecepcion) {
      const cantidadNum = parseFloat(rec.cantidadRecibida);

      // 3a. Obtener stock actual
      const inventarioActual = await tx.inventarioProyecto.findUnique({
        where: { idMaterial_idProyecto: { idMaterial: rec.idMaterial, idProyecto } },
      });

      const cantidadAnterior    = inventarioActual ? parseFloat(inventarioActual.cantidadDisponible) : 0;
      const cantidadResultante  = cantidadAnterior + cantidadNum;

      // 3b. Crear MovimientoInventario (tipo ENTRADA) — CA HU-S8-1
      const movimiento = await tx.movimientoInventario.create({
        data: {
          idMaterial:         rec.idMaterial,
          idProyecto,
          idUsuario,
          tipoMovimiento:     'ENTRADA',
          cantidad:           cantidadNum,
          cantidadAnterior,
          cantidadResultante,
          observacion:        rec.observacion
            ?? `Recepción de requerimiento ${idRequerimiento}`,
        },
        include: {
          material: { select: { nombre: true, unidad: true, codigo: true } },
          usuario:  { select: { nombre: true, apellido: true } },
        },
      });

      movimientos.push(movimiento);

      // 3c. Upsert inventario — CA HU-S8-1
      await tx.inventarioProyecto.upsert({
        where: { idMaterial_idProyecto: { idMaterial: rec.idMaterial, idProyecto } },
        create: {
          idMaterial:         rec.idMaterial,
          idProyecto,
          cantidadDisponible: cantidadResultante,
        },
        update: {
          cantidadDisponible: cantidadResultante,
        },
      });

      // 3d. Actualizar cantidadRecibida en DetalleRequerimiento
      await tx.detalleRequerimiento.updateMany({
        where: {
          idRequerimiento,
          idMaterial: rec.idMaterial,
        },
        data: {
          cantidadRecibida: {
            increment: cantidadNum,
          },
        },
      });
    }

    // 4. Actualizar estado del requerimiento a RECIBIDO si todas las cantidades están cubiertas
    const detallesActualizados = await tx.detalleRequerimiento.findMany({
      where: { idRequerimiento },
    });
    const todoRecibido = detallesActualizados.every(
      (d) => parseFloat(d.cantidadRecibida) >= parseFloat(d.cantidadSolicitada)
    );
    // 4. Actualizar estado del requerimiento a RECIBIDO si todas las cantidades están cubiertas,
    // o mantener en APROBADO pero forzando una actualización para refrescar el updatedAt (y notificar al residente)
    await tx.requerimientoCompra.update({
      where: { id: idRequerimiento },
      data: { estado: todoRecibido ? 'RECIBIDO' : 'APROBADO' },
    });

    // 5. Registrar en audit_log dentro de la misma transacción — CA HU-S8-5
    await tx.auditLog.create({
      data: {
        tabla:       'movimiento_inventario',
        operacion:   'INSERT',
        idRegistro:  movimientos[0]?.id ?? null,
        idUsuario,
        datosAntes:  null,
        datosDespues: {
          idRequerimiento,
          idProyecto,
          cantidadMovimientos: movimientos.length,
          detalles: movimientos.map((m) => ({
            id:                m.id,
            idMaterial:        m.idMaterial,
            tipoMovimiento:    m.tipoMovimiento,
            cantidad:          m.cantidad,
            cantidadAnterior:  m.cantidadAnterior,
            cantidadResultante: m.cantidadResultante,
          })),
        },
        ipOrigen,
      },
    });

    return {
      requerimiento: {
        id:     idRequerimiento,
        estado: todoRecibido ? 'RECIBIDO' : 'APROBADO',
      },
      movimientos,
      stockActualizado: movimientos.length,
    };
  }); // fin prisma.$transaction
};

// ─── HU-S8-1 (original): Movimiento libre (sin requerimiento vinculado) ───────

/**
 * Registra una entrada / salida / ajuste libre de material y actualiza el stock.
 * Operación atómica: si algo falla, NINGÚN cambio persiste.
 *
 * @param {object} datos
 * @param {string} datos.idMaterial
 * @param {string} datos.idProyecto
 * @param {string} datos.idUsuario
 * @param {string} datos.tipoMovimiento - 'ENTRADA' | 'SALIDA' | 'AJUSTE'
 * @param {number} datos.cantidad
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
    const inventarioActual = await tx.inventarioProyecto.findUnique({
      where: { idMaterial_idProyecto: { idMaterial, idProyecto } },
    });

    const cantidadAnterior = inventarioActual
      ? parseFloat(inventarioActual.cantidadDisponible)
      : 0;

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
      cantidadResultante = cantidadNum; // AJUSTE: reemplaza
    }

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

    await tx.inventarioProyecto.upsert({
      where: { idMaterial_idProyecto: { idMaterial, idProyecto } },
      create: { idMaterial, idProyecto, cantidadDisponible: cantidadResultante },
      update: { cantidadDisponible: cantidadResultante },
    });

    return movimiento;
  });
};

// ─── HU-S8-4: Consulta de inventario con desglose y diferencias ───────────────

/**
 * Lista el historial de movimientos de un proyecto con filtros opcionales.
 *
 * @param {string} idProyecto
 * @param {object} filtros
 * @param {string} [filtros.idMaterial]
 * @param {string} [filtros.tipoMovimiento]
 * @param {number} [filtros.page=1]
 * @param {number} [filtros.limit=20]
 */
const listarMovimientos = async (
  idProyecto,
  { idMaterial, tipoMovimiento, page = 1, limit = 20 } = {}
) => {
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
 * Obtiene inventario de un proyecto con desglose completo de entradas/salidas
 * y saldo calculado — CA HU-S8-4.
 *
 * Optimización: en lugar de cargar todos los movimientos en memoria para agrupar en JS,
 * usamos groupBy de Prisma para que la base de datos haga la agregación.
 * Esto reduce el tráfico de datos de O(movimientos) a O(materiales).
 *
 * @param {string} idProyecto
 * @returns {Promise<Array>} Lista de materiales con stock, entradas, salidas y diferencias
 */
const obtenerInventarioProyecto = async (idProyecto) => {
  // Ejecutar en paralelo: inventario actual + desglose agregado en BD
  const [inventarios, desgloseEntradas, desgloseSalidas, desgloseAjustes] = await Promise.all([
    prisma.inventarioProyecto.findMany({
      where: { idProyecto },
      include: {
        material: {
          select: { id: true, nombre: true, codigo: true, categoria: true, unidad: true },
        },
      },
      orderBy: { material: { nombre: 'asc' } },
    }),
    prisma.movimientoInventario.groupBy({
      by: ['idMaterial'],
      where: { idProyecto, tipoMovimiento: 'ENTRADA' },
      _sum: { cantidad: true },
    }),
    prisma.movimientoInventario.groupBy({
      by: ['idMaterial'],
      where: { idProyecto, tipoMovimiento: 'SALIDA' },
      _sum: { cantidad: true },
    }),
    prisma.movimientoInventario.groupBy({
      by: ['idMaterial'],
      where: { idProyecto, tipoMovimiento: 'AJUSTE' },
      _sum: { cantidad: true },
    }),
  ]);

  // Construir mapas de desglose para acceso O(1) por idMaterial
  const mapaEntradas = new Map(desgloseEntradas.map((r) => [r.idMaterial, parseFloat(r._sum.cantidad ?? 0)]));
  const mapaSalidas  = new Map(desgloseSalidas.map((r)  => [r.idMaterial, parseFloat(r._sum.cantidad ?? 0)]));
  const mapaAjustes  = new Map(desgloseAjustes.map((r)  => [r.idMaterial, parseFloat(r._sum.cantidad ?? 0)]));

  return inventarios.map((inv) => {
    const totalEntradas   = mapaEntradas.get(inv.idMaterial) ?? 0;
    const totalSalidas    = mapaSalidas.get(inv.idMaterial)  ?? 0;
    const totalAjustes    = mapaAjustes.get(inv.idMaterial)  ?? 0;
    const saldoCalculado  = totalEntradas - totalSalidas;
    const stockRegistrado = parseFloat(inv.cantidadDisponible);
    const diferencia      = stockRegistrado - saldoCalculado;

    return {
      idMaterial:          inv.idMaterial,
      material:            inv.material,
      stockActual:         stockRegistrado,
      ultimaActualizacion: inv.ultimaActualizacion,
      desglose: {
        totalEntradas,
        totalSalidas,
        totalAjustes,
        saldoCalculado,
        diferencia,
        ultimoMovimiento: null,
      },
    };
  });
};

/**
 * Retorna los requerimientos APROBADOS de un proyecto (para la vista del bodeguero).
 * Filtrado estricto por proyectos autorizados — CA HU-S8-1.
 *
 * @param {string} idProyecto
 * @returns {Promise<RequerimientoCompra[]>}
 */
const listarRequerimientosAprobados = async (idProyecto) => {
  return prisma.requerimientoCompra.findMany({
    where: {
      idProyecto,
      estado: 'APROBADO',
    },
    include: {
      proyecto:    { select: { id: true, codigo: true, nombre: true } },
      solicitante: { select: { id: true, nombre: true, apellido: true } },
      aprobador:   { select: { id: true, nombre: true, apellido: true } },
      detalles: {
        include: {
          material: {
            select: { id: true, codigo: true, nombre: true, unidad: true, categoria: true },
          },
        },
      },
    },
    orderBy: { fechaAprobacion: 'desc' },
  });
};

module.exports = {
  recepcionarMateriales,
  registrarMovimiento,
  listarMovimientos,
  obtenerInventarioProyecto,
  listarRequerimientosAprobados,
};
