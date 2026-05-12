const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const proyecto = await prisma.proyecto.findUnique({
    where: { id: 'c60da989-d98b-4982-8207-99e77f440999' },
    include: {
      rubros: {
        select: { id: true, codigo: true, descripcion: true, unidad: true, precioUnitario: true, cantidadPresupuestada: true, cantidadEjecutada: true, idProyecto: true }
      }
    }
  });
  console.log('Proyecto:', proyecto?.nombre);
  console.log('Total rubros:', proyecto?.rubros?.length);
  proyecto?.rubros?.slice(0, 5).forEach(r => console.log(' -', r.codigo, r.descripcion));
}
main().finally(() => prisma.$disconnect());
