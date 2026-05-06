const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Agregando nuevos rubros al proyecto PRJ-001...');

  // Buscar el proyecto PRJ-001
  const proyecto = await prisma.proyecto.findUnique({
    where: { codigo: 'PRJ-001' }
  });

  if (!proyecto) {
    console.error('❌ No se encontró el proyecto PRJ-001.');
    return;
  }

  // Nuevos rubros a agregar
  const nuevosRubros = [
    { codigo: 'RUB-04', descripcion: 'Mampostería de bloque de hormigón', unidad: 'm2', precioUnitario: 22.50, cantidadPresupuestada: 300 },
    { codigo: 'RUB-05', descripcion: 'Pintura interior vinílica', unidad: 'm2', precioUnitario: 4.80, cantidadPresupuestada: 1500 },
    { codigo: 'RUB-06', descripcion: 'Instalación de tubería PVC sanitaria 4"', unidad: 'ml', precioUnitario: 12.00, cantidadPresupuestada: 80 }
  ];

  let creados = 0;
  for (const r of nuevosRubros) {
    const existe = await prisma.rubro.findFirst({ where: { idProyecto: proyecto.id, codigo: r.codigo }});
    if (!existe) {
      await prisma.rubro.create({
        data: {
          ...r,
          idProyecto: proyecto.id
        }
      });
      creados++;
      console.log(`✅ Rubro ${r.codigo} creado exitosamente.`);
    } else {
      console.log(`⚠️ El rubro ${r.codigo} ya existe.`);
    }
  }
  console.log(`🎉 Proceso finalizado. Se crearon ${creados} rubros nuevos.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
