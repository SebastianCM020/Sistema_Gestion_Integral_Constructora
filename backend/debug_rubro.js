const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rubros = await prisma.rubro.findMany({
    include: { proyecto: { select: { nombre: true, codigo: true } } }
  });
  for (let r of rubros) {
    console.log(`${r.codigo} | idProyecto: ${r.idProyecto} | proyecto: ${r.proyecto?.nombre || 'SIN_PROYECTO'}`);
  }
}
main().finally(() => prisma.$disconnect());
