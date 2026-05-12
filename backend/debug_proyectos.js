const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const residente = await prisma.usuario.findUnique({ where: { email: 'residente@icaro.dev' }});
  console.log("Residente ID:", residente.id);

  const hoy = new Date();
  console.log("Hoy:", hoy);

  const asignaciones = await prisma.asignacionProyectoUsuario.findMany({
    where: {
      idUsuario: residente.id,
      fechaInicio: { lte: hoy },
      fechaFin: { gte: hoy },
    },
    include: { proyecto: true }
  });
  console.log("Asignaciones con filtro de fecha:", asignaciones.length);

  const todasAsignaciones = await prisma.asignacionProyectoUsuario.findMany({
    where: { idUsuario: residente.id },
    include: { proyecto: true }
  });
  console.log("Todas las asignaciones:", todasAsignaciones.length);
  if(todasAsignaciones.length > 0) {
    console.log("Fechas de la primera asignacion:", {
      fechaInicio: todasAsignaciones[0].fechaInicio,
      fechaFin: todasAsignaciones[0].fechaFin
    });
  }
}
main().finally(() => prisma.$disconnect());
