const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.usuario.findUnique({ where: { email: 'admin@icaro.dev' }, include: { rol: true }});
  console.log("Admin:", admin?.rol?.nombre, admin?.id);

  const residente = await prisma.usuario.findUnique({ where: { email: 'residente@icaro.dev' }, include: { rol: true }});
  console.log("Residente:", residente?.rol?.nombre, residente?.id);
  
  const proyectos = await prisma.proyecto.findMany();
  console.log("Proyectos totales:", proyectos.length);
}
main().finally(() => prisma.$disconnect());
