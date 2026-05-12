const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const proyectos = await prisma.proyecto.findMany({ select: { id: true, codigo: true, nombre: true } });
  proyectos.forEach(p => console.log(p.id, '|', p.codigo, '|', p.nombre));
}
main().finally(() => prisma.$disconnect());
