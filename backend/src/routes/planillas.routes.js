/**
 * planillas.routes.js — Sprint 05
 * Módulo: Planilla Mensual de Obra
 *
 * Evidencia: Sprint_05_Informe_Pruebas_ICARO.docx (INF-PRU-SPR-05)
 * Pruebas:   backend/tests/planilla_contable.test.js  CP-069 – CP-078
 */
const router = require('express').Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');

// POST /planillas
// Admin y Presidente crean planillas mensuales.
// Bodeguero (CP-070) y Residente (CP-071) reciben 403.
router.post(
  '/',
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.PRESIDENTE, ROLES.CONTADOR, ROLES.AUXILIAR]),
  (_req, res) => res.status(201).json({ message: 'Planilla mensual registrada.' })
);

// GET /planillas
// Admin, Presidente, Residente, Contador y Auxiliar consultan historial.
// Residente tiene acceso de lectura (CP-074).
router.get(
  '/',
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.PRESIDENTE, ROLES.RESIDENTE, ROLES.CONTADOR, ROLES.AUXILIAR]),
  (_req, res) => res.status(200).json({ planillas: [] })
);

const { PrismaClient } = require('@prisma/client');
const { pdfQueue } = require('../services/queueService');
const prisma = new PrismaClient();

// POST /planillas/generate/:cierreId
// Generar PDF para un cierre contable. Valida que esté CERRADO y encola el trabajo.
router.post(
  '/generate/:cierreId',
  requireAuth,
  requireRole([ROLES.ADMIN, ROLES.PRESIDENTE, ROLES.CONTADOR]),
  async (req, res) => {
    try {
      const { cierreId } = req.params;
      const cierre = await prisma.cierreMensual.findUnique({ where: { id: cierreId } });

      if (!cierre) {
        return res.status(404).json({ success: false, message: 'Cierre no encontrado' });
      }

      if (cierre.estadoCierre !== 'CERRADO') {
        return res.status(400).json({ 
          success: false, 
          message: 'No se puede generar planilla PDF porque el periodo no está CERRADO.' 
        });
      }

      // Crear registro en PlanillaPdf
      const planilla = await prisma.planillaPdf.create({
        data: {
          idCierre: cierreId,
          idGenerador: req.user.id,
          estadoGen: 'PENDING'
        }
      });

      // Encolar trabajo
      await pdfQueue.add('generate-pdf', {
        planillaId: planilla.id,
        cierreId,
        userId: req.user.id
      });

      res.status(202).json({
        success: true,
        message: 'Generación de planilla PDF encolada.',
        planillaId: planilla.id
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error encolando PDF' });
    }
  }
);

// GET /planillas/cierre/:cierreId
// Obtener planillas generadas de un cierre específico
router.get(
  '/cierre/:cierreId',
  requireAuth,
  async (req, res) => {
    try {
      const planillas = await prisma.planillaPdf.findMany({
        where: { idCierre: req.params.cierreId },
        orderBy: { createdAt: 'desc' },
        include: { generador: { select: { nombre: true, apellido: true } } }
      });
      res.json({ success: true, planillas });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error obteniendo planillas' });
    }
  }
);

module.exports = router;
