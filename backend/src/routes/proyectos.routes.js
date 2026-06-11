const express = require('express');
const router  = express.Router();
const { requireAuth, ROLES }     = require('../middlewares/auth.middleware');
const { requireProjectAccess }   = require('../middlewares/projectAccess.middleware');
const prisma = require('../utils/prisma');

/**
 * GET /api/v1/proyectos
 * Lista los proyectos asignados al usuario autenticado.
 * El Administrador ve todos los proyectos.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    let proyectos;

    const userRol = req.user.rol ? req.user.rol.toLowerCase() : '';
    if (
      userRol === ROLES.ADMIN.toLowerCase() ||
      userRol === ROLES.PRESIDENTE.toLowerCase() ||
      userRol === ROLES.CONTADOR.toLowerCase() ||
      userRol === ROLES.AUXILIAR.toLowerCase() ||
      userRol === ROLES.BODEGUERO.toLowerCase()
    ) {
      console.log(`[ProyectosRouter] Role (${req.user.rol}) ${req.user.id} — returning all active projects.`);
      proyectos = await prisma.proyecto.findMany({
        where: { estado: { in: ['ACTIVO', 'ACTIVE'] } },
        orderBy: { createdAt: 'desc' },
        include: {
          responsable: {
            select: { nombre: true, apellido: true }
          }
        }
      });
    } else {
      const hoyInicio = new Date();
      hoyInicio.setHours(0, 0, 0, 0);
      const hoyFin = new Date();
      hoyFin.setHours(23, 59, 59, 999);

      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(req.user.id);
      let asignaciones = [];
      if (isUuid) {
        asignaciones = await prisma.asignacionProyectoUsuario.findMany({
          where: {
            idUsuario:  req.user.id,
            fechaInicio: { lte: hoyFin },
            fechaFin: { gte: hoyInicio },
            proyecto: { estado: { in: ['ACTIVO', 'ACTIVE'] } }
          },
          include: {
            proyecto: {
              include: {
                responsable: {
                  select: { nombre: true, apellido: true }
                }
              }
            },
          },
        });
      } else {
        console.log(`[ProyectosRouter] Non-UUID user ID detected: ${req.user.id}. Skipping DB assignment lookup.`);
      }
      proyectos = asignaciones.map((a) => a.proyecto).filter(Boolean);
      console.log(`[ProyectosRouter] Residente/Bodeguero ${req.user.id} requested projects. Assignments found: ${asignaciones.length}`);
    }

    return res.status(200).json({ data: proyectos });
  } catch (error) {
    console.error('[ProyectosRouter] GET /:', error);
    return res.status(500).json({ error: 'Error al obtener proyectos.' });
  }
});

/**
 * GET /api/v1/proyectos/:idProyecto
 * Detalle de un proyecto específico.
 * Protegido: el usuario debe tener asignación activa (fecha vigente).
 * El Administrador tiene acceso irrestricto.
 *
 * Criterio de aceptación Act. 9:
 *   Middleware valida Token vs ID Proyecto y rango de fechas.
 *   Error 403 si no está asignado o si la asignación expiró.
 */
router.get('/:idProyecto', requireAuth, requireProjectAccess, async (req, res) => {
  try {
    const { idProyecto } = req.params;

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: idProyecto },
      include: {
        responsable: { select: { nombre: true, apellido: true } },
        rubros:  { select: { id: true, codigo: true, descripcion: true, unidad: true, precioUnitario: true, cantidadPresupuestada: true, cantidadEjecutada: true, idProyecto: true, activo: true } },
        asignaciones: {
          select: { idUsuario: true, fechaInicio: true, fechaFin: true, accessMode: true },
        },
      },
    });

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    return res.status(200).json({ data: proyecto });
  } catch (error) {
    console.error('[ProyectosRouter] GET /:idProyecto:', error);
    return res.status(500).json({ error: 'Error al obtener el proyecto.' });
  }
});

/**
 * POST /api/v1/proyectos
 * Crea un nuevo proyecto (Solo Admin).
 */
router.post('/', requireAuth, async (req, res) => {
  if (req.user.rol !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'No tiene permisos para crear proyectos.' });
  }

  try {
    const { 
      codigo, nombre, descripcion, entidadContratante, 
      numeroContrato, presupuestoTotal, fechaInicio, 
      fechaFinPrevista, estado, idResponsable 
    } = req.body;

    const proyecto = await prisma.proyecto.create({
      data: {
        codigo,
        nombre,
        descripcion,
        entidadContratante,
        numeroContrato,
        presupuestoTotal: parseFloat(presupuestoTotal),
        fechaInicio:      new Date(fechaInicio),
        fechaFinPrevista: new Date(fechaFinPrevista),
        estado:           estado || 'ACTIVO',
        idResponsable:    idResponsable || null
      },
      include: {
        responsable: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    if (idResponsable) {
      await prisma.asignacionProyectoUsuario.create({
        data: {
          idUsuario: idResponsable,
          idProyecto: proyecto.id,
          fechaInicio: proyecto.fechaInicio,
          fechaFin: proyecto.fechaFinPrevista,
          accessMode: 'READ_WRITE'
        }
      });
    }

    return res.status(201).json({ data: proyecto });
  } catch (error) {
    console.error('[ProyectosRouter] POST /:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El código del proyecto ya existe.' });
    }
    return res.status(500).json({ error: 'Error al crear el proyecto.' });
  }
});

/**
 * PUT /api/v1/proyectos/:id
 * Actualiza un proyecto existente (Solo Admin).
 */
router.put('/:id', requireAuth, async (req, res) => {
  if (req.user.rol !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'No tiene permisos para editar proyectos.' });
  }

  try {
    const { id } = req.params;
    const { 
      nombre, descripcion, entidadContratante, 
      numeroContrato, presupuestoTotal, fechaInicio, 
      fechaFinPrevista, estado, idResponsable 
    } = req.body;

    const proyecto = await prisma.proyecto.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        entidadContratante,
        numeroContrato,
        presupuestoTotal: presupuestoTotal ? parseFloat(presupuestoTotal) : undefined,
        fechaInicio:      fechaInicio ? new Date(fechaInicio) : undefined,
        fechaFinPrevista: fechaFinPrevista ? new Date(fechaFinPrevista) : undefined,
        estado,
        idResponsable
      },
      include: {
        responsable: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    // Crear asignación si se especificó idResponsable
    if (idResponsable) {
      const existeAsignacion = await prisma.asignacionProyectoUsuario.findFirst({
        where: { idUsuario: idResponsable, idProyecto: id }
      });
      if (!existeAsignacion) {
        await prisma.asignacionProyectoUsuario.create({
          data: {
            idUsuario: idResponsable,
            idProyecto: id,
            fechaInicio: proyecto.fechaInicio || new Date(),
            fechaFin: proyecto.fechaFinPrevista || new Date('2099-12-31'),
            accessMode: 'READ_WRITE'
          }
        });
      }
    }

    return res.status(200).json({ data: proyecto });
  } catch (error) {
    console.error('[ProyectosRouter] PUT /:', error);
    return res.status(500).json({ error: 'Error al actualizar el proyecto.' });
  }
});

/**
 * PATCH /api/v1/proyectos/:id/estado
 * Cambia el estado de un proyecto (ACTIVO / INACTIVO / SUSPENDIDO).
 * Sprint 6 CA: Si el proyecto pasa a INACTIVO, las nuevas transacciones
 * operativas quedan bloqueadas a nivel de API; el historial se conserva intacto.
 *
 * Solo Admin.
 */
router.patch('/:id/estado', requireAuth, async (req, res) => {
  if (req.user.rol !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'No tiene permisos para cambiar el estado del proyecto.' });
  }

  const ESTADOS_VALIDOS = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'FINALIZADO'];
  const { estado } = req.body;

  if (!estado || !ESTADOS_VALIDOS.includes(estado.toUpperCase())) {
    return res.status(400).json({
      error: `Estado inválido. Los valores permitidos son: ${ESTADOS_VALIDOS.join(', ')}.`,
    });
  }

  try {
    const { id } = req.params;

    const proyecto = await prisma.proyecto.findUnique({
      where: { id },
      select: { id: true, nombre: true, estado: true },
    });

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    const nuevoEstado = estado.toUpperCase();

    const actualizado = await prisma.proyecto.update({
      where: { id },
      data:  { estado: nuevoEstado },
      include: {
        responsable: { select: { nombre: true, apellido: true } },
      },
    });

    const mensaje = nuevoEstado === 'INACTIVO'
      ? `Proyecto "${proyecto.nombre}" desactivado. Las nuevas transacciones operativas han sido bloqueadas.`
      : `Estado del proyecto "${proyecto.nombre}" actualizado a ${nuevoEstado}.`;

    return res.status(200).json({ message: mensaje, data: actualizado });
  } catch (error) {
    console.error('[ProyectosRouter] PATCH /:id/estado:', error);
    return res.status(500).json({ error: 'Error al cambiar el estado del proyecto.' });
  }
});

/**
 * POST /api/v1/proyectos/:idProyecto/rubros/bulk
 * Carga masiva de rubros para un proyecto específico.
 */
router.post('/:idProyecto/rubros/bulk', requireAuth, requireProjectAccess, async (req, res) => {
  if (req.user.rol !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'No tiene permisos para realizar carga masiva.' });
  }

  try {
    const { idProyecto } = req.params;
    const { rubros } = req.body;

    if (!Array.isArray(rubros) || rubros.length === 0) {
      return res.status(400).json({ error: 'No se enviaron rubros para procesar.' });
    }

    const data = rubros.map((r) => ({
      codigo:               r.code ?? r.codigo,
      descripcion:          r.description ?? r.descripcion,
      unidad:               r.unit ?? r.unidad,
      precioUnitario:       parseFloat(r.unitPrice ?? r.precioUnitario ?? 0),
      cantidadPresupuestada: parseFloat(r.budgetedQuantity ?? r.cantidadPresupuestada ?? 0),
      idProyecto:           idProyecto,
    }));

    // Carga masiva en Prisma
    const result = await prisma.rubro.createMany({
      data,
      skipDuplicates: true, // Evita fallos por códigos duplicados si el usuario los ignora en la UI
    });

    return res.status(201).json({ 
      message: `Se cargaron ${result.count} rubros correctamente.`,
      count: result.count 
    });
  } catch (error) {
    console.error('[ProyectosRouter] POST /bulk:', error);
    return res.status(500).json({ error: 'Error en la carga masiva de rubros.' });
  }
});

/**
 * POST /api/v1/proyectos/:idProyecto/rubros
 * Crea un rubro individual.
 */
router.post('/:idProyecto/rubros', requireAuth, requireProjectAccess, async (req, res) => {
  if (req.user.rol !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'No tiene permisos para crear rubros.' });
  }
  try {
    const { idProyecto } = req.params;
    const { codigo, descripcion, unidad, precioUnitario, cantidadPresupuestada } = req.body;
    
    const nuevoRubro = await prisma.rubro.create({
      data: {
        codigo,
        descripcion,
        unidad,
        precioUnitario: parseFloat(precioUnitario),
        cantidadPresupuestada: parseFloat(cantidadPresupuestada),
        idProyecto,
      }
    });
    return res.status(201).json({ data: nuevoRubro });
  } catch (error) {
    console.error('[proyectos.routes.js] POST rubro error:', error);
    return res.status(500).json({ error: 'Error al crear el rubro.' });
  }
});

/**
 * PUT /api/v1/proyectos/rubros/:idRubro
 * Actualiza un rubro individual.
 */
router.put('/rubros/:idRubro', requireAuth, async (req, res) => {
  if (req.user.rol !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'No tiene permisos para editar rubros.' });
  }
  try {
    const { idRubro } = req.params;
    const { codigo, descripcion, unidad, precioUnitario, cantidadPresupuestada, activo } = req.body;
    
    const rubroEditado = await prisma.rubro.update({
      where: { id: idRubro },
      data: {
        codigo,
        descripcion,
        unidad,
        precioUnitario: parseFloat(precioUnitario),
        cantidadPresupuestada: parseFloat(cantidadPresupuestada),
        ...(activo !== undefined && { activo }),
      }
    });
    return res.status(200).json({ data: rubroEditado });
  } catch (error) {
    console.error('[proyectos.routes.js] PUT rubro error:', error);
    return res.status(500).json({ error: 'Error al actualizar el rubro.' });
  }
});

module.exports = router;
