const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Agregando 10 rubros adicionales al proyecto PRJ-001 para pruebas...');

  const proyecto = await prisma.proyecto.findUnique({
    where: { codigo: 'PRJ-001' }
  });

  if (!proyecto) {
    console.error('❌ No se encontró el proyecto PRJ-001.');
    return;
  }

  const rubros = [
    { codigo: 'RUB-07', descripcion: 'Excavación manual de zanjas (hasta 2m)', unidad: 'm3', precioUnitario: 15.50, cantidadPresupuestada: 45.00 },
    { codigo: 'RUB-08', descripcion: 'Relleno compactado con material de préstamo', unidad: 'm3', precioUnitario: 8.20, cantidadPresupuestada: 120.00 },
    { codigo: 'RUB-09', descripcion: 'Hormigón simple f´c=210 kg/cm2 para plintos', unidad: 'm3', precioUnitario: 145.00, cantidadPresupuestada: 25.50 },
    { codigo: 'RUB-10', descripcion: 'Acero de refuerzo fy=4200 kg/cm2', unidad: 'kg', precioUnitario: 1.80, cantidadPresupuestada: 4500.00 },
    { codigo: 'RUB-11', descripcion: 'Encofrado de madera para columnas', unidad: 'm2', precioUnitario: 12.00, cantidadPresupuestada: 350.00 },
    { codigo: 'RUB-12', descripcion: 'Mampostería de ladrillo visto', unidad: 'm2', precioUnitario: 28.00, cantidadPresupuestada: 180.00 },
    { codigo: 'RUB-13', descripcion: 'Enlucido vertical fino (interior)', unidad: 'm2', precioUnitario: 6.50, cantidadPresupuestada: 800.00 },
    { codigo: 'RUB-14', descripcion: 'Colocación de cerámica en pisos 60x60', unidad: 'm2', precioUnitario: 14.50, cantidadPresupuestada: 420.00 },
    { codigo: 'RUB-15', descripcion: 'Pintura exterior elastomérica', unidad: 'm2', precioUnitario: 5.80, cantidadPresupuestada: 650.00 },
    { codigo: 'RUB-16', descripcion: 'Instalación de luminarias LED tipo panel', unidad: 'un', precioUnitario: 35.00, cantidadPresupuestada: 120.00 }
  ];

  let creados = 0;
  for (const r of rubros) {
    const existe = await prisma.rubro.findFirst({ where: { idProyecto: proyecto.id, codigo: r.codigo }});
    if (!existe) {
      await prisma.rubro.create({
        data: {
          ...r,
          idProyecto: proyecto.id
        }
      });
      creados++;
      console.log(`✅ Rubro ${r.codigo} creado: ${r.descripcion}`);
    } else {
      console.log(`⚠️ Rubro ${r.codigo} ya existe. Saltando...`);
    }
  }

  console.log(`🎉 Proceso completado. ${creados} rubros nuevos agregados exitosamente.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
