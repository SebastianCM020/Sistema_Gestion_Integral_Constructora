/**
 * seed_rubros_reales.js
 * Inserta rubros reales de construcción para:
 *   - PRJ-001 · Edificio Residencial Las Palmas   (c60da989-d98b-4982-8207-99e77f440999)
 *   - CT-2025-057 · Centro Logístico Chimborazo   (a2b056d6-d8fc-4940-88e2-fb0c56fd02a7)
 * 
 * Usa skipDuplicates: true para ser idempotente (safe to re-run).
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── IDs de proyecto ─────────────────────────────────────────────────────────
const ID_LAS_PALMAS  = 'c60da989-d98b-4982-8207-99e77f440999';
const ID_CHIMBORAZO  = 'a2b056d6-d8fc-4940-88e2-fb0c56fd02a7';

// ─── Rubros reales: Edificio Residencial Las Palmas ─────────────────────────
// Basados en partidas típicas de un edificio residencial de 6 pisos (Ecuador)
const rubrosLasPalmas = [
  // 01 - OBRAS PRELIMINARES
  { codigo: 'LP-001', descripcion: 'Limpieza y desbroce del terreno',           unidad: 'm2',   precioUnitario: 1.85,   cantidadPresupuestada: 850  },
  { codigo: 'LP-002', descripcion: 'Replanteo y nivelación del área de obra',   unidad: 'm2',   precioUnitario: 2.10,   cantidadPresupuestada: 850  },
  { codigo: 'LP-003', descripcion: 'Cerramiento provisional (tabla de monte)',   unidad: 'm',    precioUnitario: 18.50,  cantidadPresupuestada: 120  },
  { codigo: 'LP-004', descripcion: 'Bodega y oficina provisional',               unidad: 'm2',   precioUnitario: 45.00,  cantidadPresupuestada: 24   },

  // 02 - MOVIMIENTO DE TIERRAS
  { codigo: 'LP-005', descripcion: 'Excavación manual de plintos',              unidad: 'm3',   precioUnitario: 8.50,   cantidadPresupuestada: 320  },
  { codigo: 'LP-006', descripcion: 'Excavación mecánica de subsuelo',           unidad: 'm3',   precioUnitario: 5.20,   cantidadPresupuestada: 1200 },
  { codigo: 'LP-007', descripcion: 'Desalojo de material con volqueta',         unidad: 'm3',   precioUnitario: 6.80,   cantidadPresupuestada: 1500 },
  { codigo: 'LP-008', descripcion: 'Relleno compactado con material de sitio',  unidad: 'm3',   precioUnitario: 7.20,   cantidadPresupuestada: 400  },

  // 03 - ESTRUCTURA
  { codigo: 'LP-009', descripcion: 'Hormigón simple f\'c=180 kg/cm2 (replantillo)',unidad: 'm3', precioUnitario: 98.00,  cantidadPresupuestada: 18   },
  { codigo: 'LP-010', descripcion: 'Hormigón en plintos f\'c=240 kg/cm2',       unidad: 'm3',   precioUnitario: 145.00, cantidadPresupuestada: 85   },
  { codigo: 'LP-011', descripcion: 'Hormigón en cadenas f\'c=240 kg/cm2',       unidad: 'm3',   precioUnitario: 160.00, cantidadPresupuestada: 42   },
  { codigo: 'LP-012', descripcion: 'Hormigón en columnas f\'c=280 kg/cm2',      unidad: 'm3',   precioUnitario: 185.00, cantidadPresupuestada: 120  },
  { codigo: 'LP-013', descripcion: 'Hormigón en losa (e=20 cm) f\'c=240 kg/cm2',unidad: 'm3',  precioUnitario: 170.00, cantidadPresupuestada: 210  },
  { codigo: 'LP-014', descripcion: 'Acero de refuerzo fy=4200 kg/cm2',         unidad: 'kg',   precioUnitario: 1.75,   cantidadPresupuestada: 28500},
  { codigo: 'LP-015', descripcion: 'Encofrado/desencofrado de columnas',        unidad: 'm2',   precioUnitario: 12.50,  cantidadPresupuestada: 680  },
  { codigo: 'LP-016', descripcion: 'Encofrado/desencofrado de losa',            unidad: 'm2',   precioUnitario: 10.80,  cantidadPresupuestada: 1050 },

  // 04 - MAMPOSTERÍA
  { codigo: 'LP-017', descripcion: 'Mampostería de bloque 15x20x40 cm',        unidad: 'm2',   precioUnitario: 18.40,  cantidadPresupuestada: 2800 },
  { codigo: 'LP-018', descripcion: 'Mampostería de bloque 10x20x40 cm (divisiones)',unidad:'m2',precioUnitario: 16.20,  cantidadPresupuestada: 1200 },

  // 05 - INSTALACIONES HIDROSANITARIAS
  { codigo: 'LP-019', descripcion: 'Tubería PVC 110mm (aguas residuales)',      unidad: 'm',    precioUnitario: 12.60,  cantidadPresupuestada: 380  },
  { codigo: 'LP-020', descripcion: 'Tubería PVC 75mm (aguas lluvias)',          unidad: 'm',    precioUnitario: 9.80,   cantidadPresupuestada: 280  },
  { codigo: 'LP-021', descripcion: 'Tubería CPVC 1/2" (agua potable fría)',     unidad: 'm',    precioUnitario: 5.40,   cantidadPresupuestada: 520  },
  { codigo: 'LP-022', descripcion: 'Tubería CPVC 3/4" (agua potable caliente)', unidad: 'm',    precioUnitario: 7.20,   cantidadPresupuestada: 320  },
  { codigo: 'LP-023', descripcion: 'Punto hidráulico completo',                 unidad: 'pto',  precioUnitario: 85.00,  cantidadPresupuestada: 96   },
  { codigo: 'LP-024', descripcion: 'Punto sanitario completo',                  unidad: 'pto',  precioUnitario: 78.00,  cantidadPresupuestada: 72   },

  // 06 - INSTALACIONES ELÉCTRICAS
  { codigo: 'LP-025', descripcion: 'Punto de iluminación (techo/pared)',        unidad: 'pto',  precioUnitario: 42.00,  cantidadPresupuestada: 180  },
  { codigo: 'LP-026', descripcion: 'Punto de tomacorriente doble',              unidad: 'pto',  precioUnitario: 38.00,  cantidadPresupuestada: 240  },
  { codigo: 'LP-027', descripcion: 'Tablero de control 12 breakers',            unidad: 'u',    precioUnitario: 185.00, cantidadPresupuestada: 12   },
  { codigo: 'LP-028', descripcion: 'Acometida eléctrica principal 4 AWG',       unidad: 'm',    precioUnitario: 14.80,  cantidadPresupuestada: 85   },

  // 07 - ACABADOS
  { codigo: 'LP-029', descripcion: 'Enlucido interior (mortero 1:3)',           unidad: 'm2',   precioUnitario: 8.20,   cantidadPresupuestada: 5400 },
  { codigo: 'LP-030', descripcion: 'Enlucido exterior (mortero impermeable)',   unidad: 'm2',   precioUnitario: 10.50,  cantidadPresupuestada: 1800 },
  { codigo: 'LP-031', descripcion: 'Ceramica piso 30x30 (áreas húmedas)',       unidad: 'm2',   precioUnitario: 22.80,  cantidadPresupuestada: 320  },
  { codigo: 'LP-032', descripcion: 'Porcelanato piso 60x60 cm (áreas secas)',   unidad: 'm2',   precioUnitario: 38.50,  cantidadPresupuestada: 1200 },
  { codigo: 'LP-033', descripcion: 'Pintura interior látex 2 manos',            unidad: 'm2',   precioUnitario: 4.80,   cantidadPresupuestada: 5400 },
  { codigo: 'LP-034', descripcion: 'Pintura exterior elastomérica 2 manos',     unidad: 'm2',   precioUnitario: 7.60,   cantidadPresupuestada: 1800 },

  // 08 - CARPINTERÍA
  { codigo: 'LP-035', descripcion: 'Puerta principal de seguridad (mdf+HDF)',   unidad: 'u',    precioUnitario: 380.00, cantidadPresupuestada: 24   },
  { codigo: 'LP-036', descripcion: 'Ventana de aluminio y vidrio 6mm',          unidad: 'm2',   precioUnitario: 95.00,  cantidadPresupuestada: 420  },
];

// ─── Rubros reales: Centro Logístico Chimborazo ──────────────────────────────
// Basados en partidas de bodega/galpón industrial (estructura metálica)
const rubrosChimborazo = [
  // 01 - OBRAS PRELIMINARES
  { codigo: 'CH-001', descripcion: 'Limpieza y desbroce del terreno (mecanizado)',unidad:'m2',  precioUnitario: 1.20,   cantidadPresupuestada: 6500 },
  { codigo: 'CH-002', descripcion: 'Cerramiento perimetral con malla electrosoldada',unidad:'m',precioUnitario: 48.00,  cantidadPresupuestada: 480  },
  { codigo: 'CH-003', descripcion: 'Caseta de guardianía 3x4m (prefabricada)',   unidad: 'u',    precioUnitario: 2800.00,cantidadPresupuestada: 2    },
  { codigo: 'CH-004', descripcion: 'Replanteo y nivelación topográfica',         unidad: 'm2',   precioUnitario: 1.60,   cantidadPresupuestada: 6500 },

  // 02 - MOVIMIENTO DE TIERRAS
  { codigo: 'CH-005', descripcion: 'Corte y nivelación de terreno (motoniveladora)',unidad:'m3', precioUnitario: 3.80,   cantidadPresupuestada: 2200 },
  { codigo: 'CH-006', descripcion: 'Sub-base clase 3 compactada (e=20cm)',       unidad: 'm3',   precioUnitario: 18.40,  cantidadPresupuestada: 1300 },
  { codigo: 'CH-007', descripcion: 'Base granular compactada (e=15cm)',          unidad: 'm3',   precioUnitario: 22.50,  cantidadPresupuestada: 975  },
  { codigo: 'CH-008', descripcion: 'Excavación de zanjas para cimentación',      unidad: 'm3',   precioUnitario: 6.20,   cantidadPresupuestada: 850  },

  // 03 - CIMENTACIÓN
  { codigo: 'CH-009', descripcion: 'Replantillo HSimple f\'c=140 kg/cm2 (e=7cm)',unidad:'m3',   precioUnitario: 88.00,  cantidadPresupuestada: 22   },
  { codigo: 'CH-010', descripcion: 'Hormigón en zapatas aisladas f\'c=240 kg/cm2',unidad:'m3',  precioUnitario: 148.00, cantidadPresupuestada: 120  },
  { codigo: 'CH-011', descripcion: 'Perno de anclaje A325 con placa base',       unidad: 'u',    precioUnitario: 28.50,  cantidadPresupuestada: 96   },
  { codigo: 'CH-012', descripcion: 'Acero de refuerzo fy=4200 kg/cm2 (cimentación)',unidad:'kg', precioUnitario: 1.75,   cantidadPresupuestada: 8500 },

  // 04 - ESTRUCTURA METÁLICA
  { codigo: 'CH-013', descripcion: 'Columna metálica HEB-200 (incl. anticorrosivo)',unidad:'kg', precioUnitario: 2.85,   cantidadPresupuestada: 18500},
  { codigo: 'CH-014', descripcion: 'Viga principal celosía tipo Pratt (acero A36)',unidad:'kg',  precioUnitario: 3.20,   cantidadPresupuestada: 24000},
  { codigo: 'CH-015', descripcion: 'Correa metálica Z-200x70 para cubierta',     unidad: 'kg',   precioUnitario: 2.60,   cantidadPresupuestada: 9500 },
  { codigo: 'CH-016', descripcion: 'Arriostramientos laterales (cables+tensores)', unidad: 'kg',  precioUnitario: 3.10,   cantidadPresupuestada: 2800 },
  { codigo: 'CH-017', descripcion: 'Montaje e izado de estructura metálica',     unidad: 'kg',   precioUnitario: 0.85,   cantidadPresupuestada: 52000},

  // 05 - CUBIERTA
  { codigo: 'CH-018', descripcion: 'Cubierta termoacústica Alum-zinc e=0.5mm',   unidad: 'm2',   precioUnitario: 18.50,  cantidadPresupuestada: 5200 },
  { codigo: 'CH-019', descripcion: 'Canalón PVC tipo A (bajantes pluviales)',    unidad: 'm',    precioUnitario: 22.00,  cantidadPresupuestada: 240  },
  { codigo: 'CH-020', descripcion: 'Cumbrero y tapas laterales (flashing)',      unidad: 'm',    precioUnitario: 15.50,  cantidadPresupuestada: 180  },
  { codigo: 'CH-021', descripcion: 'Ventana cenital industrial (claraboya)',      unidad: 'm2',   precioUnitario: 68.00,  cantidadPresupuestada: 120  },

  // 06 - FACHADA
  { codigo: 'CH-022', descripcion: 'Panel sándwich fachada e=50mm (EPS)',        unidad: 'm2',   precioUnitario: 42.00,  cantidadPresupuestada: 1800 },
  { codigo: 'CH-023', descripcion: 'Puerta seccional industrial 5x5m (motorizada)',unidad:'u',   precioUnitario: 4200.00,cantidadPresupuestada: 4    },
  { codigo: 'CH-024', descripcion: 'Puerta peatonal metálica 0.9x2.1m',          unidad: 'u',    precioUnitario: 320.00, cantidadPresupuestada: 8    },
  { codigo: 'CH-025', descripcion: 'Ventana metálica industrial vidrio 6mm',     unidad: 'm2',   precioUnitario: 88.00,  cantidadPresupuestada: 220  },

  // 07 - PISO INDUSTRIAL
  { codigo: 'CH-026', descripcion: 'Losa de hormigón f\'c=280 kg/cm2 (e=15cm)',  unidad: 'm3',   precioUnitario: 165.00, cantidadPresupuestada: 975  },
  { codigo: 'CH-027', descripcion: 'Malla electrosoldada 150x150x8mm (losa)',    unidad: 'm2',   precioUnitario: 12.80,  cantidadPresupuestada: 6500 },
  { codigo: 'CH-028', descripcion: 'Endurecedor de superficie (cuarzo rojo)',    unidad: 'kg',   precioUnitario: 3.50,   cantidadPresupuestada: 8500 },
  { codigo: 'CH-029', descripcion: 'Juntas de contracción cortadas (c/6m)',      unidad: 'm',    precioUnitario: 4.20,   cantidadPresupuestada: 1200 },
  { codigo: 'CH-030', descripcion: 'Pintura de tráfico piso (señalización)',     unidad: 'm2',   precioUnitario: 6.80,   cantidadPresupuestada: 650  },

  // 08 - INSTALACIONES ELÉCTRICAS INDUSTRIALES
  { codigo: 'CH-031', descripcion: 'Acometida eléctrica trifásica 3/0 AWG',     unidad: 'm',    precioUnitario: 48.00,  cantidadPresupuestada: 85   },
  { codigo: 'CH-032', descripcion: 'Tablero general de distribución 24 circuitos',unidad:'u',   precioUnitario: 1850.00,cantidadPresupuestada: 2    },
  { codigo: 'CH-033', descripcion: 'Luminaria LED industrial 150W (highbay)',    unidad: 'u',    precioUnitario: 185.00, cantidadPresupuestada: 48   },
  { codigo: 'CH-034', descripcion: 'Punto tomacorriente industrial 220V/30A',    unidad: 'pto',  precioUnitario: 95.00,  cantidadPresupuestada: 36   },
  { codigo: 'CH-035', descripcion: 'Puesta a tierra (electrodo copperweld)',      unidad: 'u',    precioUnitario: 280.00, cantidadPresupuestada: 4    },

  // 09 - INSTALACIONES CONTRAINCENDIOS
  { codigo: 'CH-036', descripcion: 'Rociador automático tipo spray (sprinkler)',  unidad: 'u',    precioUnitario: 48.00,  cantidadPresupuestada: 120  },
  { codigo: 'CH-037', descripcion: 'Tubería de acero galvanizado 2" (red CI)',   unidad: 'm',    precioUnitario: 38.00,  cantidadPresupuestada: 320  },
  { codigo: 'CH-038', descripcion: 'Extintor PQS 10 kg (montado)',               unidad: 'u',    precioUnitario: 95.00,  cantidadPresupuestada: 16   },
  { codigo: 'CH-039', descripcion: 'Señalética de evacuación y ruta de escape',  unidad: 'u',    precioUnitario: 28.00,  cantidadPresupuestada: 42   },

  // 10 - OBRAS EXTERIORES
  { codigo: 'CH-040', descripcion: 'Adoquín de hormigón patio de maniobras',     unidad: 'm2',   precioUnitario: 28.50,  cantidadPresupuestada: 1800 },
  { codigo: 'CH-041', descripcion: 'Cordón cuneta hormigón (perimetral)',         unidad: 'm',    precioUnitario: 18.00,  cantidadPresupuestada: 480  },
  { codigo: 'CH-042', descripcion: 'Jardinería y áreas verdes',                  unidad: 'm2',   precioUnitario: 12.00,  cantidadPresupuestada: 420  },
];

async function main() {
  console.log('\n═══ SEED RUBROS REALES ════════════════════════════════════');
  
  // ── Las Palmas ──────────────────────────────────────────────────────────────
  console.log('\n📋 Insertando rubros: Edificio Residencial Las Palmas...');
  const resultLP = await prisma.rubro.createMany({
    data: rubrosLasPalmas.map(r => ({
      ...r,
      cantidadEjecutada: 0,
      idProyecto: ID_LAS_PALMAS,
    })),
    skipDuplicates: true,
  });
  console.log(`   ✓ ${resultLP.count} rubros insertados (de ${rubrosLasPalmas.length} enviados, duplicados omitidos)`);

  // ── Chimborazo ──────────────────────────────────────────────────────────────
  console.log('\n📋 Insertando rubros: Centro Logístico Chimborazo...');
  const resultCH = await prisma.rubro.createMany({
    data: rubrosChimborazo.map(r => ({
      ...r,
      cantidadEjecutada: 0,
      idProyecto: ID_CHIMBORAZO,
    })),
    skipDuplicates: true,
  });
  console.log(`   ✓ ${resultCH.count} rubros insertados (de ${rubrosChimborazo.length} enviados, duplicados omitidos)`);

  // ── Resumen ─────────────────────────────────────────────────────────────────
  const totalRubros = await prisma.rubro.count();
  const totalLP     = await prisma.rubro.count({ where: { idProyecto: ID_LAS_PALMAS } });
  const totalCH     = await prisma.rubro.count({ where: { idProyecto: ID_CHIMBORAZO } });

  console.log('\n📊 Resumen final de la BD:');
  console.log(`   • Total rubros en BD:              ${totalRubros}`);
  console.log(`   • Las Palmas (LP-001..LP-036):     ${totalLP} rubros`);
  console.log(`   • Chimborazo (CH-001..CH-042):     ${totalCH} rubros`);
  console.log('\n════════════════════════════════════════════════════════════\n');
}

main()
  .catch(e => { console.error('Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
