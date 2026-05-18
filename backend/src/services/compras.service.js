// ─────────────────────────────────────────────────────────────────────────────
// compras.service.js — Sprint 6: Módulo de Requerimientos de Compra
//
// Contiene la lógica de negocio para la creación y consulta de requerimientos.
// Decisiones de arquitectura:
//   - Validaciones de negocio aquí (service), no en el controller.
//   - El controller solo traduce HTTP ↔ dominio.
//   - El NotificationService se dispara tras persistencia exitosa (fire-and-forget).
//   - Los materiales inactivos NO se aceptan en detalles nuevos (CA Sprint 6).
//   - Si el proyecto está INACTIVO, se bloquea la creación (CA Sprint 6).
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require('../utils/prisma');
const { emitirRequerimientoCreado } = require('./notification.service');

/**
 * Valida y crea un nuevo RequerimientoCompra en estado EN_REVISION.
 *
 * Criterios de aceptación Sprint 6:
 *   ✓ Proyecto debe estar ACTIVO (no INACTIVO/SUSPENDIDO)
 *   ✓ Justificación no vacía
 *   ✓ detalles[] no vacío
 *   ✓ cantidadSolicitada: entero positivo
 *   ✓ Materiales referenciados deben existir y estar activos
 *   ✓ Estado inicial: EN_REVISION
 *   ✓ Dispara NotificationService tras persistencia exitosa
 *
 * @param {object} params
 * @param {string}   params.idProyecto     - UUID del proyecto
 * @param {string}   params.idSolicitante  - UUID del usuario solicitante
 * @param {string}   params.justificacion  - Justificación obligatoria
 * @param {Array}    params.detalles        - [{idMaterial, cantidadSolicitada}]
 * @returns {Promise<RequerimientoCompra>}
 */
const crearRequerimiento = async ({ idProyecto, idSolicitante, justificacion, detalles }) => {
  // ── Validación 1: Justificación obligatoria ────────────────────────────────
  if (!justificacion || !justificacion.trim()) {
    const err = new Error('La justificación es obligatoria y no puede estar vacía.');
    err.status = 400;
    err.campo  = 'justificacion';
    throw err;
  }

  // ── Validación 2: Detalles no vacíos ──────────────────────────────────────
  if (!Array.isArray(detalles) || detalles.length === 0) {
    const err = new Error('El requerimiento debe incluir al menos un material (detalles[] vacío).');
    err.status = 400;
    err.campo  = 'detalles';
    throw err;
  }

  // ── Validación 3: Cantidades enteras y positivas ──────────────────────────
  for (const [index, detalle] of detalles.entries()) {
    const cantidad = Number(detalle.cantidadSolicitada);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      const err = new Error(
        `detalles[${index}].cantidadSolicitada debe ser un entero positivo. ` +
        `Recibido: "${detalle.cantidadSolicitada}".`
      );
      err.status = 400;
      err.campo  = `detalles[${index}].cantidadSolicitada`;
      throw err;
    }
  }

  // ── Validación 4: Proyecto activo ──────────────────────────────────────────
  const proyecto = await prisma.proyecto.findUnique({
    where: { id: idProyecto },
    select: { id: true, nombre: true, estado: true },
  });

  if (!proyecto) {
    const err = new Error('Proyecto no encontrado.');
    err.status = 404;
    throw err;
  }

  if (proyecto.estado !== 'ACTIVO') {
    const err = new Error(
      `No se pueden crear requerimientos para el proyecto "${proyecto.nombre}" ` +
      `porque se encuentra en estado "${proyecto.estado}". Solo proyectos ACTIVOS aceptan nuevas transacciones.`
    );
    err.status = 422;
    err.campo  = 'idProyecto';
    throw err;
  }

  // ── Validación 5: Materiales activos ──────────────────────────────────────
  const idsMateriales = detalles.map((d) => d.idMaterial);
  const materiales = await prisma.material.findMany({
    where: { id: { in: idsMateriales } },
    select: { id: true, nombre: true, activo: true },
  });

  // Verificar que todos los materiales existen
  const materialesEncontrados = new Set(materiales.map((m) => m.id));
  for (const [index, detalle] of detalles.entries()) {
    if (!materialesEncontrados.has(detalle.idMaterial)) {
      const err = new Error(
        `detalles[${index}]: Material con ID "${detalle.idMaterial}" no encontrado en el catálogo.`
      );
      err.status = 404;
      err.campo  = `detalles[${index}].idMaterial`;
      throw err;
    }
  }

  // Verificar que todos los materiales están activos
  const materialesInactivos = materiales.filter((m) => !m.activo);
  if (materialesInactivos.length > 0) {
    const nombres = materialesInactivos.map((m) => `"${m.nombre}"`).join(', ');
    const err = new Error(
      `Los siguientes materiales están inactivos y no pueden incluirse en un requerimiento: ${nombres}. ` +
      'Solo se permiten materiales del catálogo vigente.'
    );
    err.status = 422;
    err.campo  = 'detalles';
    throw err;
  }

  // ── Persistencia en transacción atómica ───────────────────────────────────
  const requerimiento = await prisma.$transaction(async (tx) => {
    const req = await tx.requerimientoCompra.create({
      data: {
        idProyecto,
        idSolicitante,
        justificacion:  justificacion.trim(),
        estado:         'EN_REVISION', // Estado inicial fijo — CA Sprint 6
        detalles: {
          create: detalles.map((d) => ({
            idMaterial:        d.idMaterial,
            cantidadSolicitada: Number(d.cantidadSolicitada),
          })),
        },
      },
      include: {
        proyecto:    { select: { id: true, codigo: true, nombre: true } },
        solicitante: { select: { id: true, nombre: true, apellido: true } },
        detalles: {
          include: {
            material: { select: { id: true, codigo: true, nombre: true, unidad: true } },
          },
        },
      },
    });
    return req;
  });

  // ── Disparar notificación (fire-and-forget) ────────────────────────────────
  // El error en la notificación NO debe revertir la persistencia del requerimiento
  emitirRequerimientoCreado({
    idRequerimiento: requerimiento.id,
    idProyecto,
    idSolicitante,
    justificacion:   requerimiento.justificacion,
    cantidadItems:   detalles.length,
  });

  return requerimiento;
};

/**
 * Lista los requerimientos de un proyecto específico.
 *
 * @param {string} idProyecto
 * @param {object} [filtros]
 * @param {string} [filtros.estado] - Filtrar por estado ('EN_REVISION', 'APROBADO', etc.)
 * @returns {Promise<RequerimientoCompra[]>}
 */
const listarRequerimientos = async (idProyecto, { estado } = {}) => {
  const where = { idProyecto };
  if (estado) where.estado = estado;

  return prisma.requerimientoCompra.findMany({
    where,
    include: {
      proyecto:    { select: { id: true, codigo: true, nombre: true } },
      solicitante: { select: { id: true, nombre: true, apellido: true } },
      aprobador:   { select: { id: true, nombre: true, apellido: true } },
      detalles: {
        include: {
          material: { select: { id: true, codigo: true, nombre: true, unidad: true } },
        },
      },
    },
    orderBy: { fechaSolicitud: 'desc' },
  });
};

/**
 * Obtiene un requerimiento por ID.
 *
 * @param {string} id - UUID del requerimiento
 * @returns {Promise<RequerimientoCompra|null>}
 */
const obtenerRequerimiento = async (id) => {
  return prisma.requerimientoCompra.findUnique({
    where: { id },
    include: {
      proyecto:    { select: { id: true, codigo: true, nombre: true } },
      solicitante: { select: { id: true, nombre: true, apellido: true } },
      aprobador:   { select: { id: true, nombre: true, apellido: true } },
      detalles: {
        include: {
          material: { select: { id: true, codigo: true, nombre: true, unidad: true } },
        },
      },
    },
  });
};

/**
 * Aprueba un requerimiento EN_REVISION.
 *
 * @param {string} idRequerimiento
 * @param {string} idAprobador
 * @returns {Promise<RequerimientoCompra>}
 */
const aprobarRequerimiento = async (idRequerimiento, idAprobador) => {
  const req = await prisma.requerimientoCompra.findUnique({ where: { id: idRequerimiento } });
  if (!req) {
    const err = new Error('Requerimiento no encontrado.');
    err.status = 404;
    throw err;
  }
  if (req.estado !== 'EN_REVISION') {
    const err = new Error(`Solo se pueden aprobar requerimientos en estado EN_REVISION. Estado actual: "${req.estado}".`);
    err.status = 409;
    throw err;
  }

  return prisma.requerimientoCompra.update({
    where: { id: idRequerimiento },
    data: {
      estado:          'APROBADO',
      idAprobador,
      fechaAprobacion: new Date(),
    },
    include: {
      proyecto:    { select: { id: true, codigo: true, nombre: true } },
      aprobador:   { select: { id: true, nombre: true, apellido: true } },
    },
  });
};

/**
 * Rechaza un requerimiento EN_REVISION.
 *
 * @param {string} idRequerimiento
 * @param {string} idAprobador
 * @param {string} comentarioRechazo
 * @returns {Promise<RequerimientoCompra>}
 */
const rechazarRequerimiento = async (idRequerimiento, idAprobador, comentarioRechazo) => {
  if (!comentarioRechazo || !comentarioRechazo.trim()) {
    const err = new Error('El comentario de rechazo es obligatorio.');
    err.status = 400;
    throw err;
  }

  const req = await prisma.requerimientoCompra.findUnique({ where: { id: idRequerimiento } });
  if (!req) {
    const err = new Error('Requerimiento no encontrado.');
    err.status = 404;
    throw err;
  }
  if (req.estado !== 'EN_REVISION') {
    const err = new Error(`Solo se pueden rechazar requerimientos en estado EN_REVISION. Estado actual: "${req.estado}".`);
    err.status = 409;
    throw err;
  }

  return prisma.requerimientoCompra.update({
    where: { id: idRequerimiento },
    data: {
      estado:             'RECHAZADO',
      idAprobador,
      comentarioRechazo:  comentarioRechazo.trim(),
      fechaAprobacion:    new Date(),
    },
    include: {
      proyecto:    { select: { id: true, codigo: true, nombre: true } },
      aprobador:   { select: { id: true, nombre: true, apellido: true } },
    },
  });
};

module.exports = {
  crearRequerimiento,
  listarRequerimientos,
  obtenerRequerimiento,
  aprobarRequerimiento,
  rechazarRequerimiento,
};
