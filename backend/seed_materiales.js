const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando inserción de materiales de prueba...');

  const materiales = [
    {
      codigo: 'MAT-CEM-001',
      nombre: 'Cemento Portland Tipo I',
      categoria: 'Materiales Cementantes',
      unidad: 'Saco 50kg',
      descripcion: 'Cemento de uso general para construcción.',
      activo: true
    },
    {
      codigo: 'MAT-ACE-002',
      nombre: 'Acero Corrugado 1/2"',
      categoria: 'Acero y Metales',
      unidad: 'Varilla 6m',
      descripcion: 'Acero de refuerzo para estructuras de concreto.',
      activo: true
    },
    {
      codigo: 'MAT-ARE-003',
      nombre: 'Arena Fina',
      categoria: 'Áridos y Agregados',
      unidad: 'm3',
      descripcion: 'Arena fina para revoques y acabados.',
      activo: true
    },
    {
      codigo: 'MAT-BLO-004',
      nombre: 'Bloque de Hormigón 15x20x40',
      categoria: 'Mampostería',
      unidad: 'Unidad',
      descripcion: 'Bloque estándar para levantamiento de muros.',
      activo: true
    },
    {
      codigo: 'MAT-PIN-005',
      nombre: 'Pintura Blanca Exterior',
      categoria: 'Acabados y Pinturas',
      unidad: 'Galón',
      descripcion: 'Pintura acrílica de alta resistencia para exteriores.',
      activo: true
    },
    {
      codigo: 'MAT-INAC-006',
      nombre: 'Material Obsoleto',
      categoria: 'Varios',
      unidad: 'Unidad',
      descripcion: 'Material de prueba inactivo.',
      activo: false
    }
  ];

  for (const mat of materiales) {
    const existing = await prisma.material.findUnique({ where: { codigo: mat.codigo } });
    if (!existing) {
      await prisma.material.create({ data: mat });
      console.log(`Material insertado: ${mat.codigo} - ${mat.nombre}`);
    } else {
      console.log(`El material ${mat.codigo} ya existe.`);
    }
  }

  console.log('Inserción de materiales completada.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
