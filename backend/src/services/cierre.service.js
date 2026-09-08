// ─────────────────────────────────────────────────────────────────────────────
// cierre.service.js — Sprint 10 (SIN migración de BD requerida)
//
// IMPORTANTE: Este servicio opera 100% sobre tablas EXISTENTES en la BD:
//   ✔ cierre_mensual    (ya existe: hash_seguridad, estado_cierre, monto_total)
//   ✔ audit_log         (ya existe: inmutable, almacena el snapshot en datos_despues)
//   ✔ avance_obra       (lectura)
//   ✔ requerimiento_compra (lectura)
//   ✔ movimiento_inventario (lectura)
//   ✔ inventario_proyecto  (lectura)
//
// Las tablas consolidacion_mensual y validacion_pre_cierre son opcionales;
// el snapshot de consolidación se persiste dentro de audit_log.datos_despues.
// ─────────────────────────────────────────────────────────────────────────────

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const prisma  = require('../utils/prisma');
const { logAction } = require('./audit.service');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Genera un hash SHA-256 de un objeto JSON serializado (claves ordenadas).
 * @param {object} payload
 * @returns {string} — Hex digest de 64 caracteres
 */
const generarHashSHA256 = (payload) => {
  const json = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash('sha256').update(json).digest('hex');
};

const esMesAnioValido = (mesAnio) => /^\d{4}-(0[1-9]|1[0-2])$/.test(mesAnio);

const rangoFechasPeriodo = (mesAnio) => {
  const [anio, mes] = mesAnio.split('-').map(Number);
  const inicio = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0));
  const fin    = new Date(Date.UTC(anio, mes, 0, 23, 59, 59, 999));
  return { inicio, fin };
};

// ── Act-1: Consolidación Mensual ──────────────────────────────────────────────

/**
 * Genera el resumen contable-operativo de un proyecto en un periodo.
 * Solo lectura — NO persiste datos por sí mismo.
 * Los datos del cierre ya existente en BD se incluyen si existe.
 */
const consolidarPeriodo = async (idProyecto, mesAnio) => {
  if (!esMesAnioValido(mesAnio)) {
    throw new Error(`Formato de periodo inválido: "${mesAnio}". Use YYYY-MM.`);
  }

  const { inicio, fin } = rangoFechasPeriodo(mesAnio);

  const proyecto = await prisma.proyecto.findUnique({
    where:   { id: idProyecto },
    include: { rubros: true },
  });
  if (!proyecto) throw new Error(`Proyecto con id "${idProyecto}" no encontrado.`);

  // ── Avances de obra en el periodo ───────────────────────────────────────
  const avances = await prisma.avanceObra.findMany({
    where: { idProyecto, fechaRegistro: { gte: inicio, lte: fin } },
    include: { rubro: true },
  });

  let totalAvanceQty = 0, totalAvanceMonto = 0;
  const rubrosAfectados = new Set();
  avances.forEach((av) => {
    const qty = parseFloat(av.cantidadAvance);
    const pu  = parseFloat(av.rubro.precioUnitario);
    totalAvanceQty   += qty;
    totalAvanceMonto += qty * pu;
    rubrosAfectados.add(av.idRubro);
  });

  // ── Requerimientos de compra ─────────────────────────────────────────────
  const requerimientos = await prisma.requerimientoCompra.findMany({
    where:   { idProyecto, fechaSolicitud: { gte: inicio, lte: fin } },
    include: { detalles: true },
  });
  const reqAprobados   = requerimientos.filter((r) => r.estado === 'APROBADO');
  const totalComprasMonto = reqAprobados.reduce((acc, req) =>
    acc + req.detalles.reduce((s, d) => s + parseFloat(d.cantidadSolicitada), 0), 0
  );

  // ── Consumos en obra (SALIDAS de bodega) ────────────────────────────────
  const consumos = await prisma.movimientoInventario.findMany({
    where: { idProyecto, tipoMovimiento: 'SALIDA', fechaMovimiento: { gte: inicio, lte: fin } },
    include: { 
      material: { select: { codigo: true, nombre: true, unidad: true } },
      usuario: { select: { nombre: true, apellido: true } }
    }
  });
  const totalConsumosQty = consumos.reduce((acc, c) => acc + parseFloat(c.cantidad), 0);
  const consumosDetalle = consumos.map(c => ({
    id: c.id,
    idMaterial: c.idMaterial,
    fecha: c.fechaMovimiento,
    codigo: c.material.codigo,
    nombre: c.material.nombre,
    unidad: c.material.unidad,
    cantidad: parseFloat(c.cantidad),
    responsable: c.usuario ? `${c.usuario.nombre} ${c.usuario.apellido}` : 'Desconocido',
    observacion: c.observacion
  }));

  // ── Snapshot inventario actual ───────────────────────────────────────────
  const inventarios = await prisma.inventarioProyecto.findMany({
    where:   { idProyecto },
    include: { material: { select: { codigo: true, nombre: true, unidad: true } } },
  });
  const snapshotInventario = inventarios.map((inv) => ({
    idMaterial:         inv.idMaterial,
    codigo:             inv.material.codigo,
    nombre:             inv.material.nombre,
    unidad:             inv.material.unidad,
    cantidadDisponible: parseFloat(inv.cantidadDisponible),
  }));

  // ── Porcentaje de avance global ──────────────────────────────────────────
  const totalPresupuestado = proyecto.rubros.reduce((acc, r) =>
    acc + parseFloat(r.cantidadPresupuestada) * parseFloat(r.precioUnitario), 0
  );
  const porcentajeAvance = totalPresupuestado > 0
    ? Math.min(100, (totalAvanceMonto / totalPresupuestado) * 100)
    : 0;

  // ── Cierre existente en BD ───────────────────────────────────────────────
  const cierreExistente = await prisma.cierreMensual.findFirst({
    where: { idProyecto, mesAnio },
  });

  return {
    idProyecto,
    mesAnio,
    proyecto:  { codigo: proyecto.codigo, nombre: proyecto.nombre, estado: proyecto.estado },
    totalAvanceQty:      parseFloat(totalAvanceQty.toFixed(4)),
    totalAvanceMonto:    parseFloat(totalAvanceMonto.toFixed(2)),
    rubrosEjecutados:    rubrosAfectados.size,
    cantidadAvances:     avances.length,
    totalRequerimientos: requerimientos.length,
    reqAprobados:        reqAprobados.length,
    totalComprasMonto:   parseFloat(totalComprasMonto.toFixed(2)),
    totalRecepciones:    requerimientos.filter((r) => r.estado === 'RECIBIDO').length,
    totalConsumosQty:    parseFloat(totalConsumosQty.toFixed(4)),
    consumosDetalle,
    snapshotInventario,
    porcentajeAvance:    parseFloat(porcentajeAvance.toFixed(2)),
    totalPresupuestado:  parseFloat(totalPresupuestado.toFixed(2)),
    cierreExistente:     cierreExistente
      ? { id: cierreExistente.id, estado: cierreExistente.estadoCierre, hash: cierreExistente.hashSeguridad }
      : null,
    generadoEn: new Date().toISOString(),
  };
};

// ── Act-2: Validación Pre-cierre ──────────────────────────────────────────────

/**
 * Valida el estado del periodo. Detecta bloqueos sin modificar la BD.
 * El resultado de la validación queda registrado en audit_log (tabla existente).
 */
const validarPreCierre = async (idProyecto, mesAnio, idUsuario) => {
  if (!esMesAnioValido(mesAnio)) {
    throw new Error(`Formato de periodo inválido: "${mesAnio}". Use YYYY-MM.`);
  }

  const { inicio, fin } = rangoFechasPeriodo(mesAnio);
  const errores = [], advertencias = [];

  // Validación 1: Avances con PENDING_SYNC (móvil no sincronizado)
  const avancesPendientes = await prisma.avanceObra.count({
    where: { idProyecto, estado: 'PENDING_SYNC', fechaRegistro: { gte: inicio, lte: fin } },
  });
  if (avancesPendientes > 0) {
    errores.push({
      codigo:      'AVN_PENDING_SYNC',
      tipo:        'ERROR',
      descripcion: `${avancesPendientes} avance(s) con estado PENDING_SYNC. Sincronice los datos móviles antes de cerrar.`,
      cantidad:    avancesPendientes,
    });
  }

  // Validación 2: Requerimientos EN_REVISION
  const reqPendientes = await prisma.requerimientoCompra.count({
    where: { idProyecto, estado: 'EN_REVISION', fechaSolicitud: { gte: inicio, lte: fin } },
  });
  if (reqPendientes > 0) {
    errores.push({
      codigo:      'REQ_EN_REVISION',
      tipo:        'ERROR',
      descripcion: `${reqPendientes} requerimiento(s) de compra en estado EN_REVISION. Apruebe o rechace antes de cerrar.`,
      cantidad:    reqPendientes,
    });
  }

  // Validación 3: Periodo ya cerrado
  const cierreCerrado = await prisma.cierreMensual.findFirst({
    where: { idProyecto, mesAnio, estadoCierre: 'CERRADO' },
  });
  if (cierreCerrado) {
    errores.push({
      codigo:      'CIERRE_DUPLICADO',
      tipo:        'ERROR',
      descripcion: `El periodo ${mesAnio} ya tiene un cierre CERRADO en la BD (ID: ${cierreCerrado.id}).`,
      idCierre:    cierreCerrado.id,
    });
  }

  // Advertencia 1: Avances rechazados
  const avancesRechazados = await prisma.avanceObra.count({
    where: { idProyecto, estado: 'REJECTED', fechaRegistro: { gte: inicio, lte: fin } },
  });
  if (avancesRechazados > 0) {
    advertencias.push({
      codigo:      'AVN_REJECTED',
      tipo:        'ADVERTENCIA',
      descripcion: `${avancesRechazados} avance(s) rechazados quedarán excluidos del consolidado.`,
    });
  }

  // Advertencia 2: Stock negativo en inventario
  const invNegativo = await prisma.inventarioProyecto.count({
    where: { idProyecto, cantidadDisponible: { lt: 0 } },
  });
  if (invNegativo > 0) {
    advertencias.push({
      codigo:      'INV_NEGATIVO',
      tipo:        'ADVERTENCIA',
      descripcion: `${invNegativo} material(es) con stock negativo. Revise movimientos de bodega.`,
    });
  }

  const valido = errores.length === 0;

  // Registrar resultado en audit_log (tabla EXISTENTE — sin modificar BD)
  await logAction({
    tabla:        'cierre_mensual',
    operacion:    'UPDATE',
    idRegistro:   null,
    idUsuario,
    datosAntes:   null,
    datosDespues: {
      accion:    'VALIDACION_PRE_CIERRE',
      idProyecto,
      mesAnio,
      valido,
      errores,
      advertencias,
      ejecutadoEn: new Date().toISOString(),
    },
    ipOrigen: null,
  });

  return { valido, errores, advertencias };
};

// ── Act-3 + Act-5: Cierre Mensual Transaccional ───────────────────────────────

/**
 * Ejecuta el cierre mensual completo dentro de una transacción Prisma estricta.
 *
 * Opera SOLO sobre tablas existentes en la BD:
 *   - cierre_mensual   → INSERT + UPDATE (estado, hash, fecha_cierre)
 *   - audit_log        → INSERT con el snapshot completo en datos_despues
 *
 * Flujo:
 *   BEGIN TX
 *     1. Pre-validar (bloquear si hay errores)
 *     2. Consolidar datos (lectura)
 *     3. Generar SHA-256 del payload
 *     4. INSERT cierre_mensual (ABIERTO)
 *     5. UPDATE cierre_mensual → CERRADO + hash + fecha
 *     6. INSERT audit_log con snapshot completo
 *   COMMIT / ROLLBACK automático si cualquier paso falla
 */
const ejecutarCierreMensual = async (idProyecto, mesAnio, idContador, ipOrigen = null) => {
  // ── Pre-validación (fuera de TX para mensaje claro) ──────────────────────
  const { valido, errores, advertencias } = await validarPreCierre(idProyecto, mesAnio, idContador);

  if (!valido) {
    const err = new Error(`Cierre bloqueado: ${errores.length} error(es) de pre-cierre detectados.`);
    err.statusCode   = 422;
    err.errores      = errores;
    err.advertencias = advertencias;
    throw err;
  }

  // ── Consolidar datos (lectura, fuera de TX) ──────────────────────────────
  const consolidacion = await consolidarPeriodo(idProyecto, mesAnio);

  // ── TRANSACCIÓN ESTRICTA (BEGIN / COMMIT / ROLLBACK automático) ──────────
  const resultado = await prisma.$transaction(async (tx) => {

    // PASO 4: Crear registro de cierre en estado ABIERTO
    const idCierre = uuidv4();
    await tx.cierreMensual.create({
      data: {
        id:           idCierre,
        idProyecto,
        idContador,
        mesAnio,
        estadoCierre: 'ABIERTO',       // campo existente en BD
        montoTotal:   consolidacion.totalAvanceMonto,
      },
    });

    // PASO 5: Generar hash SHA-256 del payload de consolidación
    const payloadHash = {
      idCierre,
      idProyecto,
      mesAnio,
      totalAvanceQty:    consolidacion.totalAvanceQty,
      totalAvanceMonto:  consolidacion.totalAvanceMonto,
      rubrosEjecutados:  consolidacion.rubrosEjecutados,
      totalRequerimientos: consolidacion.totalRequerimientos,
      totalComprasMonto: consolidacion.totalComprasMonto,
      totalRecepciones:  consolidacion.totalRecepciones,
      totalConsumosQty:  consolidacion.totalConsumosQty,
      porcentajeAvance:  consolidacion.porcentajeAvance,
      snapshotInventario: consolidacion.snapshotInventario,
      generadoEn:        new Date().toISOString(),
    };
    const hashSeguridad = generarHashSHA256(payloadHash);

    // PASO 5b: Actualizar cierre → CERRADO + hash SHA-256 + fecha
    // Todos estos campos YA EXISTEN en la tabla cierre_mensual
    const cierreFinalizado = await tx.cierreMensual.update({
      where: { id: idCierre },
      data: {
        estadoCierre:  'CERRADO',       // bloqueo del periodo
        hashSeguridad,                  // hash SHA-256
        fechaCierre:   new Date(),
        montoTotal:    consolidacion.totalAvanceMonto,
      },
    });

    // PASO 6: Registro en audit_log con snapshot completo (tabla EXISTENTE)
    // El snapshot de consolidación se guarda en datos_despues (JSONB)
    await tx.auditLog.create({
      data: {
        tabla:        'cierre_mensual',
        operacion:    'INSERT',
        idRegistro:   idCierre,
        idUsuario:    idContador,
        datosAntes:   null,
        datosDespues: {
          // Campos del cierre
          idCierre,
          idProyecto,
          mesAnio,
          estadoCierre: 'CERRADO',
          hashSeguridad,
          montoTotal:   consolidacion.totalAvanceMonto,
          // Snapshot completo de consolidación (persistido en JSONB)
          consolidacion: payloadHash,
          advertencias,
        },
        ipOrigen,
      },
    });

    return {
      cierre:        cierreFinalizado,
      hashSeguridad,
      consolidacion: { ...consolidacion, hashGenerado: hashSeguridad },
      advertencias,
    };
  }); // ← COMMIT automático

  return resultado;
};

// ── Consultas ─────────────────────────────────────────────────────────────────

const listarCierres = async (idProyecto, { limit = 20, offset = 0 } = {}) => {
  const where = idProyecto ? { idProyecto } : {};
  const [cierres, total] = await Promise.all([
    prisma.cierreMensual.findMany({
      where,
      orderBy: { mesAnio: 'desc' },
      take:    limit,
      skip:    offset,
      include: {
        proyecto: { select: { codigo: true, nombre: true } },
        contador: { select: { nombre: true, apellido: true, email: true } },
      },
    }),
    prisma.cierreMensual.count({ where }),
  ]);
  return { cierres, total, limit, offset };
};

const obtenerCierre = async (idCierre) => {
  const cierre = await prisma.cierreMensual.findUnique({
    where:   { id: idCierre },
    include: {
      proyecto: { select: { codigo: true, nombre: true, estado: true } },
      contador: { select: { nombre: true, apellido: true, email: true } },
    },
  });
  if (!cierre) throw new Error(`Cierre "${idCierre}" no encontrado.`);

  // El snapshot de consolidación está en audit_log.datos_despues (JSONB)
  const logEntry = await prisma.auditLog.findFirst({
    where:   { tabla: 'cierre_mensual', idRegistro: idCierre, operacion: 'INSERT' },
    orderBy: { timestamp: 'desc' },
  });

  return {
    cierre,
    consolidacion: logEntry?.datosDespues?.consolidacion || null,
    hashVerificado: cierre.hashSeguridad || null,
  };
};

/**
 * Aprueba (valida) un consumo de obra: registra la revisión en audit_log.
 * No modifica el movimiento ni el inventario; solo deja trazabilidad
 * de que el Contador revisó y decidió mantener el consumo.
 */
const aprobarConsumo = async (idMovimiento, idUsuario) => {
  const movimiento = await prisma.movimientoInventario.findUnique({
    where: { id: idMovimiento },
    include: { material: { select: { nombre: true, codigo: true } } },
  });

  if (!movimiento || movimiento.tipoMovimiento !== 'SALIDA') {
    const err = new Error('El consumo indicado no existe o no es de tipo SALIDA.');
    err.statusCode = 400;
    throw err;
  }

  // Verificar si el periodo ya fue cerrado
  const mesAnio = `${movimiento.fechaMovimiento.getFullYear()}-${String(movimiento.fechaMovimiento.getMonth() + 1).padStart(2, '0')}`;
  const cierreCerrado = await prisma.cierreMensual.findFirst({
    where: { idProyecto: movimiento.idProyecto, mesAnio, estadoCierre: 'CERRADO' },
  });
  if (cierreCerrado) {
    const err = new Error('No se pueden aprobar consumos de un periodo que ya se encuentra CERRADO.');
    err.statusCode = 409;
    throw err;
  }

  // Registrar trazabilidad en audit_log sin tocar el movimiento
  await logAction({
    tabla:        'movimiento_inventario',
    operacion:    'UPDATE',
    idRegistro:   idMovimiento,
    idUsuario,
    datosAntes:   null,
    datosDespues: {
      accion:      'APROBACION_CONSUMO',
      idMovimiento,
      material:    movimiento.material?.nombre,
      codigo:      movimiento.material?.codigo,
      cantidad:    parseFloat(movimiento.cantidad),
      revisadoPor: idUsuario,
      revisadoEn:  new Date().toISOString(),
    },
    ipOrigen: null,
  });

  return { aprobado: true, idMovimiento };
};

const rechazarConsumo = async (idMovimiento, idUsuario, observacionRechazo) => {
  return await prisma.$transaction(async (tx) => {
    const movOriginal = await tx.movimientoInventario.findUnique({ where: { id: idMovimiento } });
    if (!movOriginal || movOriginal.tipoMovimiento !== 'SALIDA') {
      throw new Error('El consumo indicado no existe o no es de tipo SALIDA.');
    }

    // Verificar si el periodo ya fue cerrado
    const mesAnio = `${movOriginal.fechaMovimiento.getFullYear()}-${String(movOriginal.fechaMovimiento.getMonth() + 1).padStart(2, '0')}`;
    const cierreExistente = await tx.cierreMensual.findFirst({
      where: { idProyecto: movOriginal.idProyecto, mesAnio, estadoCierre: 'CERRADO' }
    });
    if (cierreExistente) {
      throw new Error('No se pueden rechazar consumos de un periodo que ya se encuentra CERRADO.');
    }

    // Obtener inventario actual
    const inv = await tx.inventarioProyecto.findUnique({
      where: { idMaterial_idProyecto: { idMaterial: movOriginal.idMaterial, idProyecto: movOriginal.idProyecto } }
    });
    const cantidadAnterior = inv ? parseFloat(inv.cantidadDisponible) : 0;
    const cantidadResultante = cantidadAnterior + parseFloat(movOriginal.cantidad);

    // 1. Crear movimiento de reversión
    const movReverso = await tx.movimientoInventario.create({
      data: {
        idMaterial: movOriginal.idMaterial,
        idProyecto: movOriginal.idProyecto,
        idUsuario: idUsuario, // Contador o auditor que revierte
        tipoMovimiento: 'AJUSTE', // Actúa como una entrada
        cantidad: movOriginal.cantidad,
        cantidadAnterior: cantidadAnterior,
        cantidadResultante: cantidadResultante,
        observacion: `Reverso de consumo ID ${movOriginal.id.split('-')[0]}: ${observacionRechazo}`
      }
    });

    // 2. Restaurar inventario
    if (inv) {
      await tx.inventarioProyecto.update({
        where: { idMaterial_idProyecto: { idMaterial: movOriginal.idMaterial, idProyecto: movOriginal.idProyecto } },
        data: { cantidadDisponible: cantidadResultante }
      });
    } else {
      await tx.inventarioProyecto.create({
        data: {
          idMaterial: movOriginal.idMaterial,
          idProyecto: movOriginal.idProyecto,
          cantidadDisponible: cantidadResultante
        }
      });
    }

    return movReverso;
  });
};

module.exports = {
  consolidarPeriodo,
  validarPreCierre,
  ejecutarCierreMensual,
  listarCierres,
  obtenerCierre,
  rechazarConsumo,
  aprobarConsumo,
  generarHashSHA256,
};

