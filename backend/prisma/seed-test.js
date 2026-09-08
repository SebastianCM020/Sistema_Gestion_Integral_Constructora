/**
 * seed-test.js — Datos de prueba completos para el Sistema ICARO
 *
 * Genera un entorno de pruebas coherente con:
 *   - 6 roles del sistema
 *   - 7 usuarios (uno por rol + admin extra)
 *   - 3 proyectos con diferentes estados
 *   - 20 materiales en 4 categorías
 *   - 15 rubros distribuidos en proyectos
 *   - Requerimientos de compra en distintos estados
 *   - Movimientos de inventario (entradas y salidas)
 *   - Avances de obra
 *   - 2 cierres mensuales CERRADOS + 1 ABIERTO
 *   - Órdenes de cambio
 *
 * Uso:
 *   node prisma/seed-test.js
 *   DATABASE_URL=postgresql://... node prisma/seed-test.js
 *
 * El script es idempotente — puede ejecutarse múltiples veces sin duplicar datos.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

// ─── Constantes de seed ────────────────────────────────────────────────────────

const PASSWORD_DEFAULT = 'Test1234!';
const SALT_ROUNDS = 10;

const ROLES_SISTEMA = [
  { nombre: 'Administrador del Sistema', descripcion: 'Control total del sistema' },
  { nombre: 'Presidente / Gerente',      descripcion: 'Supervisión gerencial y aprobaciones' },
  { nombre: 'Contador',                  descripcion: 'Gestión contable y cierres mensuales' },
  { nombre: 'Auxiliar de Contabilidad',  descripcion: 'Apoyo en tareas contables' },
  { nombre: 'Residente',                 descripcion: 'Registro de avances de obra' },
  { nombre: 'Bodeguero',                 descripcion: 'Control de inventario y recepciones' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const log = (msg) => console.log(`  ${msg}`);
const ok  = (msg) => console.log(`  ✅ ${msg}`);
const info = (msg) => console.log(`\n📦 ${msg}`);

/**
 * Upsert genérico con mensaje de log.
 * @param {string} label - Nombre visible
 * @param {Function} fn - Función async que retorna el registro creado/actualizado
 */
const upsertLog = async (label, fn) => {
  const result = await fn();
  log(`  ${label}`);
  return result;
};

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 ICARO — Seed de datos de prueba\n');
  console.log(`  Conectando a: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}\n`);

  const passwordHash = await bcrypt.hash(PASSWORD_DEFAULT, SALT_ROUNDS);

  // ── PASO 1: Roles ──────────────────────────────────────────────────────────
  info('Creando roles del sistema...');

  const roles = {};
  for (const rolData of ROLES_SISTEMA) {
    const rol = await prisma.rol.upsert({
      where: { nombre: rolData.nombre },
      update: { descripcion: rolData.descripcion },
      create: rolData,
    });
    roles[rolData.nombre] = rol;
    log(`  Rol: ${rol.nombre} (id=${rol.id})`);
  }
  ok('Roles creados/verificados.');

  // ── PASO 2: Usuarios ───────────────────────────────────────────────────────
  info('Creando usuarios de prueba...');

  const usersData = [
    {
      email: 'admin.test@icaro.dev',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      rolNombre: 'Administrador del Sistema',
    },
    {
      email: 'gerente.test@icaro.dev',
      nombre: 'Patricia',
      apellido: 'Vargas',
      rolNombre: 'Presidente / Gerente',
    },
    {
      email: 'contador.test@icaro.dev',
      nombre: 'Roberto',
      apellido: 'Salazar',
      rolNombre: 'Contador',
    },
    {
      email: 'auxiliar.test@icaro.dev',
      nombre: 'Diana',
      apellido: 'Flores',
      rolNombre: 'Auxiliar de Contabilidad',
    },
    {
      email: 'residente.test@icaro.dev',
      nombre: 'Miguel',
      apellido: 'Torres',
      rolNombre: 'Residente',
    },
    {
      email: 'residente2.test@icaro.dev',
      nombre: 'Andrés',
      apellido: 'Pérez',
      rolNombre: 'Residente',
    },
    {
      email: 'bodeguero.test@icaro.dev',
      nombre: 'Luis',
      apellido: 'Castillo',
      rolNombre: 'Bodeguero',
    },
  ];

  const usuarios = {};
  for (const ud of usersData) {
    const usuario = await prisma.usuario.upsert({
      where: { email: ud.email },
      update: { activo: true },
      create: {
        nombre: ud.nombre,
        apellido: ud.apellido,
        email: ud.email,
        passwordHash,
        idRol: roles[ud.rolNombre].id,
        activo: true,
      },
    });
    usuarios[ud.email] = usuario;
    log(`  ${ud.rolNombre}: ${ud.email} / ${PASSWORD_DEFAULT}`);
  }
  ok('Usuarios de prueba creados.');

  // ── PASO 3: Materiales ─────────────────────────────────────────────────────
  info('Creando catálogo de materiales...');

  const materialesData = [
    // Cemento y hormigón
    { codigo: 'CEM-001', nombre: 'Cemento Portland tipo I', categoria: 'Cemento', unidad: 'saco' },
    { codigo: 'CEM-002', nombre: 'Cemento Portland tipo II', categoria: 'Cemento', unidad: 'saco' },
    // Acero y metales
    { codigo: 'ACE-001', nombre: 'Varilla de acero ø12mm', categoria: 'Acero', unidad: 'barra' },
    { codigo: 'ACE-002', nombre: 'Varilla de acero ø16mm', categoria: 'Acero', unidad: 'barra' },
    { codigo: 'ACE-003', nombre: 'Malla electrosoldada R-84', categoria: 'Acero', unidad: 'panel' },
    { codigo: 'ACE-004', nombre: 'Alambre recocido #18', categoria: 'Acero', unidad: 'kg' },
    // Áridos y prefabricados
    { codigo: 'ARE-001', nombre: 'Arena fina', categoria: 'Áridos', unidad: 'm3' },
    { codigo: 'ARE-002', nombre: 'Arena gruesa (ripio)', categoria: 'Áridos', unidad: 'm3' },
    { codigo: 'ARE-003', nombre: 'Bloque de hormigón 20x20x40', categoria: 'Áridos', unidad: 'u' },
    { codigo: 'ARE-004', nombre: 'Adoquín 20x10x8', categoria: 'Áridos', unidad: 'm2' },
    // Instalaciones
    { codigo: 'TUB-001', nombre: 'Tubo PVC ø110mm x3m', categoria: 'Instalaciones', unidad: 'u' },
    { codigo: 'TUB-002', nombre: 'Tubo galvanizado ø1"', categoria: 'Instalaciones', unidad: 'm' },
    { codigo: 'ELE-001', nombre: 'Cable THW #12 AWG', categoria: 'Instalaciones', unidad: 'm' },
    { codigo: 'ELE-002', nombre: 'Breaker 2x30A', categoria: 'Instalaciones', unidad: 'u' },
    // Acabados
    { codigo: 'ACA-001', nombre: 'Pintura látex interior blanco', categoria: 'Acabados', unidad: 'gal' },
    { codigo: 'ACA-002', nombre: 'Cerámica 30x30 (caja)', categoria: 'Acabados', unidad: 'caja' },
    { codigo: 'ACA-003', nombre: 'Porcelanato 60x60', categoria: 'Acabados', unidad: 'm2' },
    { codigo: 'ACA-004', nombre: 'Masilla de empaste', categoria: 'Acabados', unidad: 'saco' },
    // Madera y carpintería
    { codigo: 'MAD-001', nombre: 'Tabla de encofrado 1"x10"', categoria: 'Madera', unidad: 'u' },
    { codigo: 'MAD-002', nombre: 'Puntal metálico 3m', categoria: 'Madera', unidad: 'u' },
  ];

  const materiales = {};
  for (const mat of materialesData) {
    const material = await prisma.material.upsert({
      where: { codigo: mat.codigo },
      update: { activo: true },
      create: { ...mat, activo: true },
    });
    materiales[mat.codigo] = material;
  }
  ok(`${Object.keys(materiales).length} materiales creados.`);

  // ── PASO 4: Proyectos ──────────────────────────────────────────────────────
  info('Creando proyectos de prueba...');

  const adminUser = usuarios['admin.test@icaro.dev'];
  const residente1 = usuarios['residente.test@icaro.dev'];
  const residente2 = usuarios['residente2.test@icaro.dev'];
  const bodeguero  = usuarios['bodeguero.test@icaro.dev'];
  const contador   = usuarios['contador.test@icaro.dev'];

  const proyectosData = [
    {
      codigo: 'PRY-TEST-001',
      nombre: 'Construcción Bloque A — Sede Norte',
      descripcion: 'Construcción de bloque académico de 4 pisos',
      entidadContratante: 'Municipio de Riobamba',
      numeroContrato: 'CONTR-2025-001',
      presupuestoTotal: 850000,
      fechaInicio: new Date('2025-01-15'),
      fechaFinPrevista: new Date('2026-12-31'),
      estado: 'ACTIVO',
      idResponsable: adminUser.id,
    },
    {
      codigo: 'PRY-TEST-002',
      nombre: 'Adoquinado Vía Panamericana km 4',
      descripcion: 'Pavimentación y adoquinado de 2.5km de vía',
      entidadContratante: 'Gobierno Provincial de Chimborazo',
      numeroContrato: 'CONTR-2025-002',
      presupuestoTotal: 320000,
      fechaInicio: new Date('2025-03-01'),
      fechaFinPrevista: new Date('2025-12-31'),
      estado: 'ACTIVO',
      idResponsable: adminUser.id,
    },
    {
      codigo: 'PRY-TEST-003',
      nombre: 'Alcantarillado Barrio El Rosal',
      descripcion: 'Instalación de red de alcantarillado sanitario',
      entidadContratante: 'GADM Riobamba',
      numeroContrato: 'CONTR-2024-015',
      presupuestoTotal: 180000,
      fechaInicio: new Date('2024-06-01'),
      fechaFinPrevista: new Date('2025-01-31'),
      estado: 'FINALIZADO',
      idResponsable: adminUser.id,
    },
  ];

  const proyectos = {};
  for (const pd of proyectosData) {
    const proyecto = await prisma.proyecto.upsert({
      where: { codigo: pd.codigo },
      update: { estado: pd.estado },
      create: pd,
    });
    proyectos[pd.codigo] = proyecto;
    log(`  ${pd.codigo}: ${pd.nombre} (${pd.estado})`);
  }
  ok('Proyectos creados.');

  // ── PASO 5: Asignaciones ───────────────────────────────────────────────────
  info('Creando asignaciones de usuarios a proyectos...');

  const asignaciones = [
    // Proyecto 1 (Bloque A)
    { idUsuario: residente1.id, idProyecto: proyectos['PRY-TEST-001'].id, fechaInicio: new Date('2025-01-15'), fechaFin: new Date('2026-12-31') },
    { idUsuario: bodeguero.id,  idProyecto: proyectos['PRY-TEST-001'].id, fechaInicio: new Date('2025-01-15'), fechaFin: new Date('2026-12-31') },
    // Proyecto 2 (Adoquinado)
    { idUsuario: residente2.id, idProyecto: proyectos['PRY-TEST-002'].id, fechaInicio: new Date('2025-03-01'), fechaFin: new Date('2025-12-31') },
    { idUsuario: bodeguero.id,  idProyecto: proyectos['PRY-TEST-002'].id, fechaInicio: new Date('2025-03-01'), fechaFin: new Date('2025-12-31') },
    // Proyecto 3 (Alcantarillado - finalizado)
    { idUsuario: residente1.id, idProyecto: proyectos['PRY-TEST-003'].id, fechaInicio: new Date('2024-06-01'), fechaFin: new Date('2025-01-31') },
  ];

  for (const asig of asignaciones) {
    const existing = await prisma.asignacionProyectoUsuario.findFirst({
      where: { idUsuario: asig.idUsuario, idProyecto: asig.idProyecto },
    });
    if (!existing) {
      await prisma.asignacionProyectoUsuario.create({
        data: { ...asig, accessMode: 'READ_WRITE' },
      });
    }
  }
  ok('Asignaciones creadas.');

  // ── PASO 6: Rubros ─────────────────────────────────────────────────────────
  info('Creando rubros por proyecto...');

  const rubrosData = [
    // Proyecto 1 — Bloque A
    { idProyecto: 'PRY-TEST-001', codigo: 'R-001-01', descripcion: 'Excavación manual', unidad: 'm3', precioUnitario: 18.50, cantidadPresupuestada: 500 },
    { idProyecto: 'PRY-TEST-001', codigo: 'R-001-02', descripcion: 'Hormigón ciclopeo f\'c=140 kg/cm2', unidad: 'm3', precioUnitario: 145.00, cantidadPresupuestada: 120 },
    { idProyecto: 'PRY-TEST-001', codigo: 'R-001-03', descripcion: 'Mampostería de bloque 20x20x40', unidad: 'm2', precioUnitario: 28.75, cantidadPresupuestada: 2400 },
    { idProyecto: 'PRY-TEST-001', codigo: 'R-001-04', descripcion: 'Estructura metálica nivel 2', unidad: 'kg', precioUnitario: 4.20, cantidadPresupuestada: 15000 },
    { idProyecto: 'PRY-TEST-001', codigo: 'R-001-05', descripcion: 'Cubierta de losa alivianada', unidad: 'm2', precioUnitario: 95.00, cantidadPresupuestada: 800 },
    // Proyecto 2 — Adoquinado
    { idProyecto: 'PRY-TEST-002', codigo: 'R-002-01', descripcion: 'Movimiento de tierra', unidad: 'm3', precioUnitario: 12.00, cantidadPresupuestada: 3500 },
    { idProyecto: 'PRY-TEST-002', codigo: 'R-002-02', descripcion: 'Subbase clase 3', unidad: 'm3', precioUnitario: 32.50, cantidadPresupuestada: 1800 },
    { idProyecto: 'PRY-TEST-002', codigo: 'R-002-03', descripcion: 'Adoquín vehicular 20x10x8', unidad: 'm2', precioUnitario: 28.00, cantidadPresupuestada: 8500 },
    { idProyecto: 'PRY-TEST-002', codigo: 'R-002-04', descripcion: 'Bordillo de hormigón', unidad: 'm', precioUnitario: 22.00, cantidadPresupuestada: 5000 },
    // Proyecto 3 — Alcantarillado (finalizado)
    { idProyecto: 'PRY-TEST-003', codigo: 'R-003-01', descripcion: 'Excavación zanja', unidad: 'm3', precioUnitario: 22.00, cantidadPresupuestada: 2200 },
    { idProyecto: 'PRY-TEST-003', codigo: 'R-003-02', descripcion: 'Tubería PVC 250mm', unidad: 'm', precioUnitario: 48.00, cantidadPresupuestada: 1200 },
    { idProyecto: 'PRY-TEST-003', codigo: 'R-003-03', descripcion: 'Pozos de revisión D=1.4m', unidad: 'u', precioUnitario: 680.00, cantidadPresupuestada: 40 },
    { idProyecto: 'PRY-TEST-003', codigo: 'R-003-04', descripcion: 'Relleno y compactación', unidad: 'm3', precioUnitario: 16.00, cantidadPresupuestada: 1800 },
    { idProyecto: 'PRY-TEST-003', codigo: 'R-003-05', descripcion: 'Rotura y reposición de capa de rodadura', unidad: 'm2', precioUnitario: 38.00, cantidadPresupuestada: 900 },
  ];

  const rubros = {};
  for (const rd of rubrosData) {
    const idProyecto = proyectos[rd.idProyecto].id;
    const existing = await prisma.rubro.findFirst({
      where: { idProyecto, codigo: rd.codigo },
    });
    if (!existing) {
      const rubro = await prisma.rubro.create({
        data: { ...rd, idProyecto },
      });
      rubros[`${rd.idProyecto}-${rd.codigo}`] = rubro;
    } else {
      rubros[`${rd.idProyecto}-${rd.codigo}`] = existing;
    }
  }
  ok(`${Object.keys(rubros).length} rubros creados.`);

  // ── PASO 7: Requerimientos de compra ───────────────────────────────────────
  info('Creando requerimientos de compra...');

  const pry1 = proyectos['PRY-TEST-001'];
  const pry2 = proyectos['PRY-TEST-002'];

  // Requerimiento 1 — APROBADO (listo para recepcionar en bodega)
  const req1Existing = await prisma.requerimientoCompra.findFirst({
    where: { idProyecto: pry1.id, idSolicitante: residente1.id, estado: 'APROBADO' },
  });

  let req1;
  if (!req1Existing) {
    req1 = await prisma.requerimientoCompra.create({
      data: {
        idProyecto: pry1.id,
        idSolicitante: residente1.id,
        idAprobador: adminUser.id,
        estado: 'APROBADO',
        justificacion: 'Materiales para cimentación del bloque A',
        fechaSolicitud: new Date('2025-04-10'),
        fechaAprobacion: new Date('2025-04-12'),
        detalles: {
          create: [
            { idMaterial: materiales['CEM-001'].id, cantidadSolicitada: 200, cantidadRecibida: 0 },
            { idMaterial: materiales['ACE-001'].id, cantidadSolicitada: 150, cantidadRecibida: 0 },
            { idMaterial: materiales['ARE-001'].id, cantidadSolicitada: 45,  cantidadRecibida: 0 },
          ],
        },
      },
    });
  } else {
    req1 = req1Existing;
  }

  // Requerimiento 2 — RECIBIDO (ya procesado en bodega)
  const req2Existing = await prisma.requerimientoCompra.findFirst({
    where: { idProyecto: pry1.id, estado: 'RECIBIDO' },
  });

  let req2;
  if (!req2Existing) {
    req2 = await prisma.requerimientoCompra.create({
      data: {
        idProyecto: pry1.id,
        idSolicitante: residente1.id,
        idAprobador: adminUser.id,
        estado: 'RECIBIDO',
        justificacion: 'Encofrado para columnas nivel 1',
        fechaSolicitud: new Date('2025-03-01'),
        fechaAprobacion: new Date('2025-03-03'),
        detalles: {
          create: [
            { idMaterial: materiales['MAD-001'].id, cantidadSolicitada: 120, cantidadRecibida: 120 },
            { idMaterial: materiales['MAD-002'].id, cantidadSolicitada: 40,  cantidadRecibida: 40 },
          ],
        },
      },
    });
  } else {
    req2 = req2Existing;
  }

  // Requerimiento 3 — EN_REVISION (pendiente)
  const req3Existing = await prisma.requerimientoCompra.findFirst({
    where: { idProyecto: pry2.id, estado: 'EN_REVISION' },
  });

  if (!req3Existing) {
    await prisma.requerimientoCompra.create({
      data: {
        idProyecto: pry2.id,
        idSolicitante: residente2.id,
        estado: 'EN_REVISION',
        justificacion: 'Adoquines para la primera etapa',
        fechaSolicitud: new Date('2025-05-15'),
        detalles: {
          create: [
            { idMaterial: materiales['ARE-004'].id, cantidadSolicitada: 2500, cantidadRecibida: 0 },
          ],
        },
      },
    });
  }

  ok('Requerimientos de compra creados.');

  // ── PASO 8: Movimientos de inventario ──────────────────────────────────────
  info('Creando movimientos de inventario...');

  // Entradas de materiales al proyecto 1
  const entradasPry1 = [
    { idMaterial: 'MAD-001', cantidad: 120, cantidadAnterior: 0, cantidadResultante: 120 },
    { idMaterial: 'MAD-002', cantidad: 40,  cantidadAnterior: 0, cantidadResultante: 40 },
    { idMaterial: 'CEM-001', cantidad: 80,  cantidadAnterior: 0, cantidadResultante: 80 },
    { idMaterial: 'ACE-001', cantidad: 60,  cantidadAnterior: 0, cantidadResultante: 60 },
    { idMaterial: 'ARE-001', cantidad: 20,  cantidadAnterior: 0, cantidadResultante: 20 },
  ];

  let invCount = 0;
  for (const entrada of entradasPry1) {
    const existing = await prisma.movimientoInventario.findFirst({
      where: {
        idMaterial: materiales[entrada.idMaterial].id,
        idProyecto: pry1.id,
        tipoMovimiento: 'ENTRADA',
      },
    });
    if (!existing) {
      await prisma.movimientoInventario.create({
        data: {
          idMaterial: materiales[entrada.idMaterial].id,
          idProyecto: pry1.id,
          idUsuario: bodeguero.id,
          tipoMovimiento: 'ENTRADA',
          cantidad: entrada.cantidad,
          cantidadAnterior: entrada.cantidadAnterior,
          cantidadResultante: entrada.cantidadResultante,
          observacion: 'Entrada inicial — seed de prueba',
          fechaMovimiento: new Date('2025-03-05'),
        },
      });

      // Actualizar inventario
      await prisma.inventarioProyecto.upsert({
        where: { idMaterial_idProyecto: { idMaterial: materiales[entrada.idMaterial].id, idProyecto: pry1.id } },
        create: { idMaterial: materiales[entrada.idMaterial].id, idProyecto: pry1.id, cantidadDisponible: entrada.cantidadResultante },
        update: { cantidadDisponible: entrada.cantidadResultante },
      });
      invCount++;
    }
  }

  // Salidas (consumos de obra) en el proyecto 1
  const salidasPry1 = [
    { idMaterial: 'CEM-001', cantidad: 30, cantidadAnterior: 80, cantidadResultante: 50 },
    { idMaterial: 'ACE-001', cantidad: 20, cantidadAnterior: 60, cantidadResultante: 40 },
    { idMaterial: 'MAD-001', cantidad: 50, cantidadAnterior: 120, cantidadResultante: 70 },
  ];

  for (const salida of salidasPry1) {
    const existing = await prisma.movimientoInventario.findFirst({
      where: {
        idMaterial: materiales[salida.idMaterial].id,
        idProyecto: pry1.id,
        tipoMovimiento: 'SALIDA',
      },
    });
    if (!existing) {
      await prisma.movimientoInventario.create({
        data: {
          idMaterial: materiales[salida.idMaterial].id,
          idProyecto: pry1.id,
          idUsuario: residente1.id,
          tipoMovimiento: 'SALIDA',
          cantidad: salida.cantidad,
          cantidadAnterior: salida.cantidadAnterior,
          cantidadResultante: salida.cantidadResultante,
          observacion: 'Consumo en obra — seed de prueba',
          fechaMovimiento: new Date('2025-04-20'),
        },
      });

      // Actualizar inventario
      await prisma.inventarioProyecto.update({
        where: { idMaterial_idProyecto: { idMaterial: materiales[salida.idMaterial].id, idProyecto: pry1.id } },
        data: { cantidadDisponible: salida.cantidadResultante },
      }).catch(() => {}); // Ignorar si no existe el registro
      invCount++;
    }
  }
  ok(`${invCount} movimientos de inventario + stock creados.`);

  // ── PASO 9: Avances de obra ────────────────────────────────────────────────
  info('Creando avances de obra...');

  const rubroPry1_01 = rubros['PRY-TEST-001-R-001-01'];
  const rubroPry1_02 = rubros['PRY-TEST-001-R-001-02'];

  const avancesData = [
    {
      idProyecto: pry1.id,
      idRubro: rubroPry1_01?.id,
      idResidente: residente1.id,
      cantidadAvance: 380,
      fechaRegistro: new Date('2025-03-15'),
      estado: 'VALIDATED',
      notas: 'Excavación completada zona A-B',
    },
    {
      idProyecto: pry1.id,
      idRubro: rubroPry1_01?.id,
      idResidente: residente1.id,
      cantidadAvance: 85,
      fechaRegistro: new Date('2025-04-10'),
      estado: 'SYNCED',
      notas: 'Excavación zona C pendiente de validación',
    },
    {
      idProyecto: pry1.id,
      idRubro: rubroPry1_02?.id,
      idResidente: residente1.id,
      cantidadAvance: 45,
      fechaRegistro: new Date('2025-04-25'),
      estado: 'VALIDATED',
      notas: 'Hormigón ciclopeo cimentación completado',
    },
  ];

  let avanceCount = 0;
  for (const av of avancesData) {
    if (!av.idRubro) continue;
    const existing = await prisma.avanceObra.findFirst({
      where: { idProyecto: av.idProyecto, idRubro: av.idRubro, fechaRegistro: av.fechaRegistro },
    });
    if (!existing) {
      await prisma.avanceObra.create({ data: av });
      avanceCount++;
    }
  }
  ok(`${avanceCount} avances de obra creados.`);

  // ── PASO 10: Cierres mensuales ─────────────────────────────────────────────
  info('Creando cierres mensuales...');

  const cierresData = [
    {
      idProyecto: pry1.id,
      idContador: contador.id,
      mesAnio: '2025-03',
      estadoCierre: 'CERRADO',
      montoTotal: 76125.00,
      hashSeguridad: 'abc123def456abc123def456abc123def456abc123def456abc123def456abcd',
      fechaCierre: new Date('2025-04-05'),
    },
    {
      idProyecto: pry1.id,
      idContador: contador.id,
      mesAnio: '2025-04',
      estadoCierre: 'CERRADO',
      montoTotal: 54890.50,
      hashSeguridad: 'def456abc123def456abc123def456abc123def456abc123def456abc123defg',
      fechaCierre: new Date('2025-05-03'),
    },
    {
      idProyecto: pry1.id,
      idContador: contador.id,
      mesAnio: '2025-05',
      estadoCierre: 'ABIERTO',
      montoTotal: 0,
    },
  ];

  for (const cd of cierresData) {
    const existing = await prisma.cierreMensual.findFirst({
      where: { idProyecto: cd.idProyecto, mesAnio: cd.mesAnio },
    });
    if (!existing) {
      await prisma.cierreMensual.create({ data: cd });
      log(`  Cierre ${cd.mesAnio} (${cd.estadoCierre})`);
    }
  }
  ok('Cierres mensuales creados.');

  // ── RESUMEN FINAL ──────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  console.log('🎉 Seed completado exitosamente.\n');
  console.log('  Credenciales de acceso:');
  console.log(`  ┌─────────────────────────────────────────────────────┐`);
  console.log(`  │  Email                          │ Contraseña        │`);
  console.log(`  ├─────────────────────────────────┼───────────────────┤`);
  for (const ud of usersData) {
    const padding = ' '.repeat(32 - ud.email.length);
    console.log(`  │  ${ud.email}${padding}│ ${PASSWORD_DEFAULT}       │`);
  }
  console.log(`  └─────────────────────────────────────────────────────┘`);
  console.log('\n  Backend: http://localhost:3001');
  console.log('  POST /api/v1/auth/login con { email, password }');
  console.log('─'.repeat(60) + '\n');
}

main()
  .catch((error) => {
    console.error('\n❌ Error en seed:', error.message);
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
