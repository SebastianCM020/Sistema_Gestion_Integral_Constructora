const { Worker } = require('bullmq');
const { connection } = require('../services/queueService');
const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const io = require('../socket');

const prisma = new PrismaClient();

const pdfWorker = new Worker('pdf-generation', async job => {
  const { planillaId, cierreId, userId } = job.data;
  
  try {
    // 1. Marcar como "GENERATING"
    await prisma.planillaPdf.update({
      where: { id: planillaId },
      data: { estadoGen: 'GENERATING' }
    });

    // 2. Traer datos
    const cierre = await prisma.cierreMensual.findUnique({
      where: { id: cierreId },
      include: {
        proyecto: true,
        consolidacion: true,
      }
    });

    if (!cierre) throw new Error('Cierre no encontrado');

    // 3. Generar PDF
    const filename = `planilla_${cierreId}_${Date.now()}.pdf`;
    const uploadsDir = path.join(__dirname, '../../uploads/planillas');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, filename);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('Planilla de Cierre Mensual', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Proyecto: ${cierre.proyecto.nombre}`);
    doc.text(`Mes/Año: ${cierre.mesAnio}`);
    doc.text(`Monto Total: $${cierre.montoTotal}`);
    
    if (cierre.consolidacion) {
      doc.moveDown();
      doc.text(`Avance Global: ${cierre.consolidacion.porcentajeAvance}%`);
      doc.text(`Total Avance (Cantidad): ${cierre.consolidacion.totalAvanceQty}`);
      doc.text(`Total Avance (Monto): $${cierre.consolidacion.totalAvanceMonto}`);
      doc.text(`Total Compras (Monto): $${cierre.consolidacion.totalComprasMonto}`);
      doc.text(`Total Consumos (Monto): $${cierre.consolidacion.totalConsumosMonto}`);
    }

    doc.end();

    // Simular un procesamiento pesado
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Actualizar estado y urlArchivo
    await prisma.planillaPdf.update({
      where: { id: planillaId },
      data: { 
        estadoGen: 'READY',
        urlArchivo: `/uploads/planillas/${filename}`
      }
    });

    // 5. Notificar al usuario vía socket
    io.getIO().to(`user_${userId}`).emit('planilla_ready', {
      message: 'Planilla PDF generada exitosamente.',
      planillaId,
      url: `/uploads/planillas/${filename}`
    });

    return { success: true, filename };

  } catch (error) {
    console.error('Error generando PDF:', error);
    await prisma.planillaPdf.update({
      where: { id: planillaId },
      data: { estadoGen: 'ERROR' }
    });
    
    io.getIO().to(`user_${userId}`).emit('planilla_error', {
      message: 'Error al generar la planilla PDF.',
      planillaId
    });

    throw error;
  }
}, { connection });

pdfWorker.on('failed', (job, err) => {
  console.error(`Trabajo ${job.id} falló:`, err);
});

module.exports = pdfWorker;
