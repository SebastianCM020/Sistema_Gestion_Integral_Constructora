const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const bodeguero = await prisma.usuario.findFirst({
    where: { email: 'bodeguero@icaro.dev' },
    include: { rol: true }
  });
  
  if (!bodeguero) {
    console.log("No se encontro bodeguero@icaro.dev");
    return;
  }
  
  console.log("Testeando Proyectos para", bodeguero.rol.nombre);
  try {
    const proyectos = await prisma.proyecto.findMany({
      where: { estado: { in: ['ACTIVO', 'ACTIVE'] } },
      orderBy: { createdAt: 'desc' },
      include: { responsable: { select: { nombre: true, apellido: true } } }
    });
    console.log("Proyectos count:", proyectos.length);
    if (proyectos.length > 0) {
      console.log("Primer proyecto:", proyectos[0].nombre);
    }
  } catch (err) {
    console.error("Error proyectos:", err.message);
  }
  
  console.log("\nTesteando Notificaciones...");
  try {
    const aprobados = await prisma.requerimientoCompra.findMany({
      where: { estado: 'APROBADO' },
      include: {
        proyecto: { select: { nombre: true, codigo: true } },
        aprobador: { select: { nombre: true, apellido: true } }
      },
      orderBy: { fechaAprobacion: 'desc' },
      take: 10
    });
    console.log("Notificaciones count:", aprobados.length);
  } catch (err) {
    console.error("Error notif:", err.message);
  }
}

run().finally(() => prisma.$disconnect());
