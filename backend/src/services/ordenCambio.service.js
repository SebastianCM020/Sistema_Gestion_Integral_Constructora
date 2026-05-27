// ─────────────────────────────────────────────────────────────────────────────
// ordenCambio.service.js - Sprint 7: Órdenes de Cambio
//
// Responsabilidad: lógica de negocio para crear, aprobar, rechazar y
// consultar órdenes de cambio que habilitan avances sobre el presupuesto.
//
// CA Actividad 4:
//   - Avance excedente sin orden aprobada → bloqueado (403)
//   - Con orden aprobada vigente → permitido dentro del nuevo límite
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const prisma    = require('../utils/prisma');
const { logAction } = require('./audit.service');

const ESTADOS_FINALES = new Set(['APROBADA', 'RECHAZADA']);

// ── Helpers de validación ──────────────────────────────────────────────────

/**
 * Lanza un error con código HTTP personalizado.
 * @param {string} message
 * @param {number} status
 * @param {string} [campo]
 */
const domainError = (message, status, campo) => {
  const err = new Error(message);
  err.status = status;
  if (campo) err.campo = campo;
  return err;
};

// ── Casos de uso ──────────────────────────────────────────────────────────

/**
 * Crea una nueva orden de cambio (estado PENDIENTE).
 *
 * @param {object} datos
 * @param {string} datos.idProyecto
 * @param {string} datos.idRubro
 * @param {string} datos.idSolicitante
 * @param {string} datos.motivo
 * @param {number} datos.cantidadAdicional
 * @returns {Promise<OrdenCambio>}
 */
const crearOrdenCambio = async ({ idProyecto, idRubro, idSolicitante, motivo, cantidadAdicional }) => {
  // Validaciones de dominio
  if (!motivo || !motivo.trim()) {
    throw domainError('El motivo de la orden de cambio es obligatorio.', 400, 'motivo');
  }

  const cantidad = Number(cantidadAdicional);
  if (!cantidad || cantidad <= 0) {
    throw domainError('La cantidad adicional debe ser un número positivo.', 400, 'cantidadAdicional');
  }

  // Verificar que el rubro pertenece al proyecto
  const rubro = await prisma.rubro.findUnique({
    where: { id: idRubro },
    select: { id: true, idProyecto: true, descripcion: true, cantidadPresupuestada: true },
  });

  if (!rubro) throw domainError('Rubro no encontrado.', 404, 'idRubro');
  if (rubro.idProyecto !== idProyecto) {
    throw domainError('El rubro no pertenece al proyecto indicado.', 422, 'idRubro');
  }

  const orden = await prisma.ordenCambio.create({
    data: {
      idProyecto,
      idRubro,
      idSolicitante,
      motivo: motivo.trim(),
      cantidadAdicional: cantidad,
      estado: 'PENDIENTE',
    },
    include: {
      rubro:       { select: { id: true, codigo: true, descripcion: true } },
      proyecto:    { select: { id: true, codigo: true, nombre: true } },
      solicitante: { select: { id: true, nombre: true, apellido: true } },
    },
  });

  // Registro de auditoría
  await logAction({
    tabla:        'ordenes_cambio',
    operacion:    'INSERT',
    idRegistro:   orden.id,
    idUsuario:    idSolicitante,
    datosDespues: { estado: 'PENDIENTE', cantidadAdicional: cantidad, idRubro, idProyecto },
  });

  return orden;
};

/**
 * Lista las órdenes de cambio de un proyecto con filtros opcionales.
 *
 * @param {string} idProyecto
 * @param {object} [filtros]
 * @param {string} [filtros.estado]
 * @param {string} [filtros.idRubro]
 * @returns {Promise<OrdenCambio[]>}
 */
const listarOrdenesCambio = async (idProyecto, { estado, idRubro } = {}) => {
  const where = { idProyecto };
  if (estado)  where.estado  = estado;
  if (idRubro) where.idRubro = idRubro;

  return prisma.ordenCambio.findMany({
    where,
    include: {
      rubro:       { select: { id: true, codigo: true, descripcion: true, cantidadPresupuestada: true } },
      proyecto:    { select: { id: true, codigo: true, nombre: true } },
      solicitante: { select: { id: true, nombre: true, apellido: true } },
      aprobador:   { select: { id: true, nombre: true, apellido: true } },
    },
    orderBy: { fechaSolicitud: 'desc' },
  });
};

/**
 * Aprueba una orden de cambio PENDIENTE.
 * CA: Solo se puede aprobar desde PENDIENTE (bloqueo de reprocesamiento).
 *
 * @param {string} idOrden
 * @param {string} idAprobador
 * @param {string} [comentario]
 * @returns {Promise<OrdenCambio>}
 */
const aprobarOrdenCambio = async (idOrden, idAprobador, comentario) => {
  const orden = await prisma.ordenCambio.findUnique({ where: { id: idOrden } });

  if (!orden) throw domainError('Orden de cambio no encontrada.', 404);
  if (ESTADOS_FINALES.has(orden.estado)) {
    throw domainError(
      `La orden de cambio ya está en estado ${orden.estado} y no puede modificarse.`,
      409
    );
  }

  const datosAntes = { estado: orden.estado };

  const actualizada = await prisma.ordenCambio.update({
    where: { id: idOrden },
    data: {
      estado:              'APROBADA',
      idAprobador,
      comentarioAprobador: comentario?.trim() || null,
      fechaResolucion:     new Date(),
    },
    include: {
      rubro:    { select: { id: true, codigo: true, descripcion: true, cantidadPresupuestada: true } },
      proyecto: { select: { id: true, codigo: true, nombre: true } },
    },
  });

  await logAction({
    tabla:        'ordenes_cambio',
    operacion:    'UPDATE',
    idRegistro:   idOrden,
    idUsuario:    idAprobador,
    datosAntes,
    datosDespues: { estado: 'APROBADA', comentario },
  });

  return actualizada;
};

/**
 * Rechaza una orden de cambio PENDIENTE.
 * El comentario del aprobador es obligatorio.
 *
 * @param {string} idOrden
 * @param {string} idAprobador
 * @param {string} comentario - obligatorio
 * @returns {Promise<OrdenCambio>}
 */
const rechazarOrdenCambio = async (idOrden, idAprobador, comentario) => {
  if (!comentario || !comentario.trim()) {
    throw domainError('El comentario es obligatorio para rechazar una orden de cambio.', 400, 'comentario');
  }

  const orden = await prisma.ordenCambio.findUnique({ where: { id: idOrden } });

  if (!orden) throw domainError('Orden de cambio no encontrada.', 404);
  if (ESTADOS_FINALES.has(orden.estado)) {
    throw domainError(
      `La orden de cambio ya está en estado ${orden.estado} y no puede modificarse.`,
      409
    );
  }

  const datosAntes = { estado: orden.estado };

  const actualizada = await prisma.ordenCambio.update({
    where: { id: idOrden },
    data: {
      estado:              'RECHAZADA',
      idAprobador,
      comentarioAprobador: comentario.trim(),
      fechaResolucion:     new Date(),
    },
    include: {
      rubro:    { select: { id: true, codigo: true, descripcion: true } },
      proyecto: { select: { id: true, codigo: true, nombre: true } },
    },
  });

  await logAction({
    tabla:        'ordenes_cambio',
    operacion:    'UPDATE',
    idRegistro:   idOrden,
    idUsuario:    idAprobador,
    datosAntes,
    datosDespues: { estado: 'RECHAZADA', comentario },
  });

  return actualizada;
};

/**
 * Valida si un avance excedente está permitido por una orden de cambio aprobada.
 * CA Actividad 4: lógica central de validación presupuestaria.
 *
 * @param {string} idRubro
 * @param {number} cantidadAvance
 * @returns {Promise<{permitido: boolean, excedente: boolean, margenDisponible: number, idOrden: string|null, mensaje: string|null}>}
 */
const validarExcedentePorOrdenCambio = async (idRubro, cantidadAvance) => {
  const rubro = await prisma.rubro.findUnique({
    where: { id: idRubro },
    select: { cantidadPresupuestada: true, cantidadEjecutada: true },
  });

  if (!rubro) throw domainError('Rubro no encontrado.', 404);

  const presupuestado = Number(rubro.cantidadPresupuestada);
  const ejecutado     = Number(rubro.cantidadEjecutada) || 0;
  const nuevoTotal    = ejecutado + cantidadAvance;
  const margenBase    = presupuestado - ejecutado;

  // Sin excedente: siempre permitido
  if (nuevoTotal <= presupuestado) {
    return { permitido: true, excedente: false, margenDisponible: margenBase, idOrden: null, mensaje: null };
  }

  // Hay excedente → buscar orden APROBADA más reciente para el rubro
  const orden = await prisma.ordenCambio.findFirst({
    where:   { idRubro, estado: 'APROBADA' },
    orderBy: { fechaResolucion: 'desc' },
    select:  { id: true, cantidadAdicional: true },
  });

  if (!orden) {
    return {
      permitido:        false,
      excedente:        true,
      margenDisponible: 0,
      idOrden:          null,
      mensaje:          'Excedente presupuestal sin orden de cambio aprobada. Solicite una Orden de Cambio para continuar.',
    };
  }

  const margenConOrden = (presupuestado + Number(orden.cantidadAdicional)) - ejecutado;

  if (cantidadAvance <= margenConOrden) {
    return {
      permitido:        true,
      excedente:        true,
      margenDisponible: margenConOrden,
      idOrden:          orden.id,
      mensaje:          null,
    };
  }

  return {
    permitido:        false,
    excedente:        true,
    margenDisponible: margenConOrden,
    idOrden:          orden.id,
    mensaje:          `El avance (${cantidadAvance}) supera el límite aprobado. Margen disponible con la orden de cambio: ${margenConOrden.toFixed(4)}.`,
  };
};

module.exports = {
  crearOrdenCambio,
  listarOrdenesCambio,
  aprobarOrdenCambio,
  rechazarOrdenCambio,
  validarExcedentePorOrdenCambio,
};
