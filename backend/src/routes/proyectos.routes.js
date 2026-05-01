const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');

const { requireAuth, ROLES }     = require('../middlewares/auth.middleware');
const { requireProjectAccess }   = require('../middlewares/projectAccess.middleware');

const prisma = new PrismaClient();

/**
 * GET /api/v1/proyectos
 * Lista los proyectos asignados al usuario autenticado.
 * El Administrador ve todos los proyectos.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    let proyectos;

    if (req.user.rol === ROLES.ADMIN) {
      // El Admin ve todos
      proyectos = await prisma.proyecto.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          responsable: {
            select: { nombre: true, apellido: true }
          }
        }
      });
    } else {
      // Otros roles solo ven los proyectos donde tienen asignación vigente
      const hoy = new Date();
      const asignaciones = await prisma.asignacionProyectoUsuario.findMany({
        where: {
          idUsuario:  req.user.id,
          fechaInicio: { lte: hoy },
          fechaFin:    { gte: hoy },
        },
        include: {
          proyecto: {
            select: {
              id: true, codigo: true, nombre: true,
              estado: true, fechaInicio: true, fechaFinPrevista: true,
              presupuestoTotal: true,
            },
          },
        },
      });
      proyectos = asignaciones.map((a) => a.proyecto);
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
        rubros:  { select: { id: true, codigo: true, descripcion: true, unidad: true, precioUnitario: true, cantidadPresupuestada: true, cantidadEjecutada: true } },
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

    return res.status(200).json({ data: proyecto });
  } catch (error) {
    console.error('[ProyectosRouter] PUT /:', error);
    return res.status(500).json({ error: 'Error al actualizar el proyecto.' });
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

    // Mapear al formato de la DB
    const data = rubros.map((r) => ({
      codigo:               r.code || r.codigo,
      descripcion:          r.description || r.descripcion,
      unidad:               r.unit || r.unidad,
      precioUnitario:       parseFloat(r.unitPrice || r.precioUnitario),
      cantidadPresupuestada: parseFloat(r.budgetedQuantity || r.cantidadPresupuestada),
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

module.exports = router;
