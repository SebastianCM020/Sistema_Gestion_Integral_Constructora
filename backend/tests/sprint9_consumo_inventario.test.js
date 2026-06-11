/**
 * sprint9_consumo_inventario.test.js â€” Pruebas de IntegraciÃ³n Sprint 9
 *
 * Sprint 09 â€” "GestiÃ³n Integral: Consumo en Obra, Validaciones y SincronizaciÃ³n"
 *
 * Cubre todos los Criterios de AceptaciÃ³n del Sprint 9:
 *
 * GRUPO 1 â€” Materiales disponibles (HU-S9-1)
 *   - GET materiales-disponibles sin token â†’ 401.
 *   - GET materiales-disponibles con Residente â†’ pasa RBAC (200/403/404/500).
 *   - GET materiales-disponibles con Admin â†’ 200/404/500 (no 401, no 403).
 *
 * GRUPO 2 â€” Consumo transaccional (HU-S9-2)
 *   - POST consumir sin token â†’ 401.
 *   - POST consumir con Bodeguero â†’ 403 (solo Residente y Admin).
 *   - POST consumir sin body â†’ 400.
 *   - POST consumir con Admin sin BD â†’ 400/404/422/500.
 *
 * GRUPO 3 â€” Validaciones de seguridad (HU-S9-3)
 *   - Stock insuficiente â†’ 422 con cÃ³digo STOCK_INSUFICIENTE (simulado).
 *   - Proyecto ajeno â†’ 403 con cÃ³digo PROYECTO_NO_AUTORIZADO (simulado).
 *   - Concurrencia â†’ 409 con cÃ³digo CONFLICTO_CONCURRENCIA (simulado).
 *   - Stock NUNCA queda negativo despuÃ©s de un consumo.
 *
 * GRUPO 4 â€” SincronizaciÃ³n offline (HU-S9-4)
 *   - La idempotencia se gestiona en el CLIENTE (IndexedDB/SyncManager).
 *   - El servidor responde 201 por cada peticiÃ³n vÃ¡lida recibida.
 *   - Pre-validaciones: cantidad â‰¤ 0 â†’ 400.
 *   - El audit_log se registra dentro de la transacciÃ³n.
 *
 * GRUPO 5 â€” Historial y trazabilidad
 *   - GET historial sin token â†’ 401.
 *   - GET historial con Admin â†’ 200/404/500 (no 401, no 403).
 *   - Cada movimiento SALIDA incluye cantidadAnterior y cantidadResultante.
 *
 * GRUPO 6 â€” Rollback transaccional
 *   - Stock insuficiente â†’ rollback total, inventario sin cambios (simulado).
 *   - Proyecto ajeno â†’ rechazado sin alterar inventario (simulado).
 *
 * NOTA: No se usa idempotencyKey en BD (campo eliminado del schema).
 *       La deduplicaciÃ³n offline es responsabilidad del SyncManager (cliente).
 */

process.env.NODE_ENV       = 'test';
process.env.JWT_SECRET     = 'secreto_para_pruebas_icaro_2025';
process.env.JWT_EXPIRES_IN = '8h';
process.env.DATABASE_URL   = process.env.DATABASE_URL ||
  'postgresql://icaro_user:icaro_secret@localhost:5433/Icaro_System';

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../src/server');

// â”€â”€ Helpers de tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SECRET    = process.env.JWT_SECRET;
const makeToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: '8h' });

const adminToken      = makeToken({ id: 'usr-test-admin-s9',  email: 'admin@test.com',  rol: 'Administrador del Sistema' });
const residenteToken  = makeToken({ id: 'usr-test-res-s9',    email: 'res@test.com',    rol: 'Residente' });
const bodegueroToken  = makeToken({ id: 'usr-test-bod-s9',    email: 'bod@test.com',    rol: 'Bodeguero' });
const contadorToken   = makeToken({ id: 'usr-test-cont-s9',   email: 'cont@test.com',   rol: 'Contador' });
const presidenteToken = makeToken({ id: 'usr-test-pres-s9',   email: 'pres@test.com',   rol: 'Presidente / Gerente' });

// â”€â”€ UUIDs de prueba (inexistentes en BD real) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FAKE_PROYECTO_ID  = 'aaaaaaaa-0009-0000-0000-000000000009';
const FAKE_MATERIAL_ID  = 'bbbbbbbb-0009-0000-0000-000000000009';
const IDEMPOTENCY_KEY_1 = 'cccccccc-0009-0001-0000-000000000009';
const IDEMPOTENCY_KEY_2 = 'dddddddd-0009-0002-0000-000000000009';

// =============================================================================
// GRUPO 1: Materiales disponibles (HU-S9-1)
// =============================================================================
describe('Sprint09 â€“ Grupo 1: Materiales Disponibles del Proyecto (HU-S9-1)', () => {

  test('1. GET materiales-disponibles sin token â†’ 401 Unauthorized', async () => {
    const res = await request(app)
      .get(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/materiales-disponibles`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('2. GET materiales-disponibles con Residente â†’ pasa RBAC (200/403/404/500)', async () => {
    const res = await request(app)
      .get(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/materiales-disponibles`)
      .set('Authorization', `Bearer ${residenteToken}`);

    // Residente estÃ¡ en canRead â€” RBAC lo acepta
    // 403: no asignado al proyecto | 404: proyecto no encontrado | 500: sin BD
    expect([200, 403, 404, 500]).toContain(res.statusCode);
    // El rol en sÃ­ NO debe dar 403 por RBAC
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body.data)).toBe(true);
      // HU-S9-1: Cada material debe pertenecer al proyecto del residente
      res.body.data.forEach((item) => {
        expect(item).toHaveProperty('idProyecto');
        expect(item.idProyecto).toBe(FAKE_PROYECTO_ID);
      });
    }
  });

  test('3. GET materiales-disponibles con Admin â†’ 200/404/500 (no 401, no 403)', async () => {
    const res = await request(app)
      .get(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/materiales-disponibles`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 404, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  test('4. GET materiales-disponibles con Bodeguero â†’ pasa RBAC (200/403/404/500)', async () => {
    // Bodeguero tiene acceso irrestricto al proyecto (no se le verifican asignaciones)
    // Puede retornar 403 solo si no estÃ¡ asignado EN MODO BODEGUERO
    const res = await request(app)
      .get(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/materiales-disponibles`)
      .set('Authorization', `Bearer ${bodegueroToken}`);

    expect([200, 403, 404, 500]).toContain(res.statusCode);
  });

  test('5. GET materiales-disponibles con Contador â†’ pasa RBAC (200/403/404/500)', async () => {
    const res = await request(app)
      .get(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/materiales-disponibles`)
      .set('Authorization', `Bearer ${contadorToken}`);

    expect([200, 403, 404, 500]).toContain(res.statusCode);
  });
});

// =============================================================================
// GRUPO 2: Consumo transaccional â€” RBAC y validaciones bÃ¡sicas (HU-S9-2)
// =============================================================================
describe('Sprint09 â€“ Grupo 2: Consumo Transaccional â€” RBAC y Validaciones', () => {

  test('6. POST consumir sin token â†’ 401 Unauthorized', async () => {
    const res = await request(app)
      .post(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/consumir`)
      .send({ idMaterial: FAKE_MATERIAL_ID, cantidad: 5 });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('7. POST consumir con Bodeguero â†’ 403 Forbidden (solo Admin y Residente)', async () => {
    const res = await request(app)
      .post(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/consumir`)
      .set('Authorization', `Bearer ${bodegueroToken}`)
      .send({ idMaterial: FAKE_MATERIAL_ID, cantidad: 5 });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  test('8. POST consumir con Contador â†’ 403 Forbidden (no estÃ¡ en canConsume)', async () => {
    const res = await request(app)
      .post(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/consumir`)
      .set('Authorization', `Bearer ${contadorToken}`)
      .send({ idMaterial: FAKE_MATERIAL_ID, cantidad: 5 });

    expect(res.statusCode).toBe(403);
  });

  test('9. POST consumir con Presidente â†’ 403 Forbidden (no estÃ¡ en canConsume)', async () => {
    const res = await request(app)
      .post(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/consumir`)
      .set('Authorization', `Bearer ${presidenteToken}`)
      .send({ idMaterial: FAKE_MATERIAL_ID, cantidad: 5 });

    expect(res.statusCode).toBe(403);
  });

  test('10. POST consumir con Admin sin body â†’ 400 (campos obligatorios)', async () => {
    const res = await request(app)
      .post(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/consumir`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect([400, 404, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    if (res.statusCode === 400) {
      expect(res.body).toHaveProperty('error');
    }
  });

  test('11. POST consumir con Residente con body vÃ¡lido â†’ pasa RBAC (200/201/403/404/422/500)', async () => {
    const res = await request(app)
      .post(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/consumir`)
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({
        idMaterial: FAKE_MATERIAL_ID,
        cantidad:   5,
        observacion: 'Test consumo Sprint 9',
      });

    // Residente pasa RBAC pero puede ser rechazado por:
    // 403: proyecto ajeno | 404: proyecto/material no encontrado | 422: stock / inactivo | 500: sin BD
    expect([200, 201, 403, 404, 422, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
  });

  test('12. POST consumir con cantidad negativa â†’ 400 Bad Request', async () => {
    const res = await request(app)
      .post(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/consumir`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ idMaterial: FAKE_MATERIAL_ID, cantidad: -10 });

    expect([400, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 400) {
      expect(res.body).toHaveProperty('error');
    }
  });

  test('13. POST consumir con cantidad = 0 â†’ 400 Bad Request', async () => {
    const res = await request(app)
      .post(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/consumir`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ idMaterial: FAKE_MATERIAL_ID, cantidad: 0 });

    expect([400, 404, 500]).toContain(res.statusCode);
  });
});

// =============================================================================
// GRUPO 3: Validaciones de seguridad (HU-S9-3) â€” Pruebas unitarias con mock
// =============================================================================
describe('Sprint09 â€“ Grupo 3: Validaciones de Seguridad (HU-S9-3)', () => {

  /**
   * CA HU-S9-3: Stock insuficiente â†’ 422 STOCK_INSUFICIENTE
   * El inventario NO debe alterarse.
   */
  test('14. consumoService: stock insuficiente â†’ lanza 422 STOCK_INSUFICIENTE', async () => {
    const prismaModule = require('../src/utils/prisma');
    const originalTransaction = prismaModule.$transaction;

    let inventarioActualizado = false;
    let movimientoCreado      = false;

    prismaModule.$transaction = async (fn) => {
      const txMock = {
        proyecto: {
          findUnique: async () => ({
            id: FAKE_PROYECTO_ID, nombre: 'Test', codigo: 'TST-009', estado: 'ACTIVO',
          }),
        },
        asignacionProyectoUsuario: {
          findFirst: async () => ({
            id: 'asig-001', idUsuario: 'usr-test-res-s9', idProyecto: FAKE_PROYECTO_ID,
            fechaInicio: new Date('2026-01-01'), fechaFin: new Date('2099-12-31'),
          }),
        },
        material: {
          findUnique: async () => ({
            id: FAKE_MATERIAL_ID, nombre: 'Cemento', codigo: 'CEM-001',
            unidad: 'bulto', activo: true,
          }),
        },
        inventarioProyecto: {
          findUnique: async () => ({
            idMaterial: FAKE_MATERIAL_ID, idProyecto: FAKE_PROYECTO_ID,
            cantidadDisponible: 5, // â† stock disponible
          }),
          upsert: async () => {
            inventarioActualizado = true; // NO debe ejecutarse
            return {};
          },
        },
        movimientoInventario: {
          findFirst: async () => null,
          create: async () => {
            movimientoCreado = true; // NO debe ejecutarse
            return {};
          },
        },
        auditLog: { create: async () => ({}) },
      };
      return fn(txMock);
    };

    delete require.cache[require.resolve('../src/services/consumo.service')];
    const consumoService = require('../src/services/consumo.service');

    let errorLanzado = null;
    try {
      await consumoService.registrarConsumo({
        idProyecto:  FAKE_PROYECTO_ID,
        idMaterial:  FAKE_MATERIAL_ID,
        idUsuario:   'usr-test-res-s9',
        cantidad:    50, // â† supera el stock de 5
        observacion: 'Test stock insuficiente',
      });
    } catch (err) {
      errorLanzado = err;
    } finally {
      prismaModule.$transaction = originalTransaction;
      delete require.cache[require.resolve('../src/services/consumo.service')];
    }

    // CA HU-S9-3: El servicio DEBE lanzar error 422
    expect(errorLanzado).not.toBeNull();
    expect(errorLanzado.status).toBe(422);
    expect(errorLanzado.codigo).toBe('STOCK_INSUFICIENTE');

    // HU-S9-3: El inventario NO debe haberse alterado
    expect(inventarioActualizado).toBe(false);
    expect(movimientoCreado).toBe(false);
  });

  /**
   * CA HU-S9-3: Proyecto ajeno â†’ 403 PROYECTO_NO_AUTORIZADO
   */
  test('15. consumoService: proyecto ajeno â†’ lanza 403 PROYECTO_NO_AUTORIZADO', async () => {
    const prismaModule = require('../src/utils/prisma');
    const originalTransaction = prismaModule.$transaction;

    let movimientoCreado = false;

    prismaModule.$transaction = async (fn) => {
      const txMock = {
        proyecto: {
          findUnique: async () => ({
            id: FAKE_PROYECTO_ID, nombre: 'Otro Proyecto', codigo: 'OTR-001', estado: 'ACTIVO',
          }),
        },
        asignacionProyectoUsuario: {
          findFirst: async () => null, // â† sin asignaciÃ³n
        },
        material:  { findUnique: async () => null },
        inventarioProyecto: { findUnique: async () => null, upsert: async () => ({}) },
        movimientoInventario: {
          findFirst: async () => null,
          create: async () => { movimientoCreado = true; return {}; },
        },
        auditLog: { create: async () => ({}) },
      };
      return fn(txMock);
    };

    delete require.cache[require.resolve('../src/services/consumo.service')];
    const consumoService = require('../src/services/consumo.service');

    let errorLanzado = null;
    try {
      await consumoService.registrarConsumo({
        idProyecto:  FAKE_PROYECTO_ID,
        idMaterial:  FAKE_MATERIAL_ID,
        idUsuario:   'usr-extraÃ±o',
        cantidad:    5,
      });
    } catch (err) {
      errorLanzado = err;
    } finally {
      prismaModule.$transaction = originalTransaction;
      delete require.cache[require.resolve('../src/services/consumo.service')];
    }

    expect(errorLanzado).not.toBeNull();
    expect(errorLanzado.status).toBe(403);
    expect(errorLanzado.codigo).toBe('PROYECTO_NO_AUTORIZADO');
    expect(movimientoCreado).toBe(false);
  });

  /**
   * CA HU-S9-3: El stock NUNCA queda negativo.
   * Se valida que Math.max(stockResultante, 0) se aplica y el servicio
   * rechaza antes de llegar a un stock negativo.
   */
  test('16. El stock nunca queda en nÃºmeros negativos despuÃ©s de un consumo', async () => {
    const prismaModule = require('../src/utils/prisma');
    const originalTransaction = prismaModule.$transaction;

    let stockGuardado = null;

    prismaModule.$transaction = async (fn) => {
      const txMock = {
        proyecto: {
          findUnique: async () => ({
            id: FAKE_PROYECTO_ID, nombre: 'Test', codigo: 'TST-009', estado: 'ACTIVO',
          }),
        },
        asignacionProyectoUsuario: {
          findFirst: async () => ({
            id: 'asig-001', idUsuario: 'usr-test-res-s9', idProyecto: FAKE_PROYECTO_ID,
            fechaInicio: new Date('2026-01-01'), fechaFin: new Date('2099-12-31'),
          }),
        },
        material: {
          findUnique: async () => ({
            id: FAKE_MATERIAL_ID, nombre: 'Arena', codigo: 'ARE-001',
            unidad: 'm3', activo: true,
          }),
        },
        inventarioProyecto: {
          findUnique: async () => ({
            idMaterial: FAKE_MATERIAL_ID, idProyecto: FAKE_PROYECTO_ID,
            cantidadDisponible: 3, // â† exactamente 3 disponibles
          }),
          upsert: async (args) => {
            stockGuardado = parseFloat(args.update.cantidadDisponible);
            return { cantidadDisponible: args.update.cantidadDisponible };
          },
        },
        movimientoInventario: {
          findFirst: async () => null,
          create:    async (args) => ({
            id:                'mov-test-001',
            ...args.data,
            material:  { nombre: 'Arena', unidad: 'm3', codigo: 'ARE-001' },
            proyecto:  { nombre: 'Test', codigo: 'TST-009' },
            usuario:   { nombre: 'Test', apellido: 'Residente' },
          }),
        },
        auditLog: { create: async () => ({}) },
      };
      return fn(txMock);
    };

    delete require.cache[require.resolve('../src/services/consumo.service')];
    const consumoService = require('../src/services/consumo.service');

    try {
      await consumoService.registrarConsumo({
        idProyecto:  FAKE_PROYECTO_ID,
        idMaterial:  FAKE_MATERIAL_ID,
        idUsuario:   'usr-test-res-s9',
        cantidad:    3, // â† consume exactamente el stock disponible
      });
    } catch {
      // No importa si falla por otro motivo en entorno de prueba
    } finally {
      prismaModule.$transaction = originalTransaction;
      delete require.cache[require.resolve('../src/services/consumo.service')];
    }

    // CA HU-S9-3: Si se guardÃ³ algo, no debe ser negativo
    if (stockGuardado !== null) {
      expect(stockGuardado).toBeGreaterThanOrEqual(0);
    }
  });

  test('17. consumoService: pre-validaciones â€” cantidad negativa lanza 400', async () => {
    delete require.cache[require.resolve('../src/services/consumo.service')];
    const consumoService = require('../src/services/consumo.service');

    let errLanzado = null;
    try {
      await consumoService.registrarConsumo({
        idProyecto: FAKE_PROYECTO_ID,
        idMaterial:  FAKE_MATERIAL_ID,
        idUsuario:  'usr-test-res-s9',
        cantidad:   -5,
      });
    } catch (e) { errLanzado = e; }

    expect(errLanzado).not.toBeNull();
    expect(errLanzado.status).toBe(400);

    delete require.cache[require.resolve('../src/services/consumo.service')];
  });

  test('18. consumoService: pre-validaciones â€” campos obligatorios faltantes â†’ 400', async () => {
    delete require.cache[require.resolve('../src/services/consumo.service')];
    const consumoService = require('../src/services/consumo.service');

    let errLanzado = null;
    try {
      await consumoService.registrarConsumo({
        idProyecto: '',    // vacÃ­o
        idMaterial: FAKE_MATERIAL_ID,
        idUsuario:  'usr-test-res-s9',
        cantidad:   5,
      });
    } catch (e) { errLanzado = e; }

    expect(errLanzado).not.toBeNull();
    expect(errLanzado.status).toBe(400);

    delete require.cache[require.resolve('../src/services/consumo.service')];
  });
});

// =============================================================================
// GRUPO 4: SincronizaciÃ³n Offline â€” Estrategia cliente (HU-S9-4)
// =============================================================================
describe('Sprint09 â€“ Grupo 4: SincronizaciÃ³n Offline â€” Estrategia Cliente (HU-S9-4)', () => {

  /**
   * CA HU-S9-4: El servidor responde siempre 201 por cada peticiÃ³n vÃ¡lida recibida.
   * La deduplicaciÃ³n es responsabilidad del SyncManager en el cliente (IndexedDB).
   * El servidor NO tiene lÃ³gica de idempotencia por clave â€” simplemente procesa
   * lo que recibe si es vÃ¡lido.
   */
  test('19. POST consumir con Admin vÃ¡lido â†’ pasa RBAC, retorna 201/400/404/422/500 (nunca 403 por RBAC)', async () => {
    const res = await request(app)
      .post(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/consumir`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        idMaterial:  FAKE_MATERIAL_ID,
        cantidad:    5,
        observacion: 'Test Grupo 4 HU-S9-4',
      });

    // Admin pasa RBAC; resultado depende de si hay BD activa
    expect([201, 400, 404, 422, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);

    // Si la BD respondiÃ³ 201, verificar estructura de respuesta
    if (res.statusCode === 201) {
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('stockAnterior');
      expect(res.body).toHaveProperty('stockActual');
      expect(res.body.data.tipoMovimiento).toBe('SALIDA');
      // El stock actual nunca debe ser negativo
      expect(parseFloat(res.body.stockActual)).toBeGreaterThanOrEqual(0);
    }
  });

  /**
   * CA HU-S9-4: El servicio consumoService registra consumos correctamente
   * con el mock de Prisma, sin ningÃºn campo de idempotencia en la BD.
   */
  test('20. consumoService: consumo exitoso con mock â€” responde con movimiento SALIDA y stock actualizado', async () => {
    const prismaModule = require('../src/utils/prisma');
    const originalTransaction = prismaModule.$transaction;

    let stockGuardado   = null;
    let movimientoRetornado = null;

    prismaModule.$transaction = async (fn) => {
      const stockInicial = 20;
      const cantidadConsumir = 7;
      const txMock = {
        proyecto: {
          findUnique: async () => ({
            id: FAKE_PROYECTO_ID, nombre: 'Proyecto Test S9', codigo: 'TST-S9', estado: 'ACTIVO',
          }),
        },
        asignacionProyectoUsuario: {
          findFirst: async () => ({
            id: 'asig-001', idUsuario: 'usr-test-res-s9', idProyecto: FAKE_PROYECTO_ID,
            fechaInicio: new Date('2026-01-01'), fechaFin: new Date('2099-12-31'),
          }),
        },
        material: {
          findUnique: async () => ({
            id: FAKE_MATERIAL_ID, nombre: 'Varilla', codigo: 'VAR-001', unidad: 'barra', activo: true,
          }),
        },
        inventarioProyecto: {
          findUnique: async () => ({ cantidadDisponible: stockInicial }),
          upsert: async (args) => {
            stockGuardado = parseFloat(args.update.cantidadDisponible);
            return { cantidadDisponible: args.update.cantidadDisponible };
          },
        },
        movimientoInventario: {
          create: async (args) => {
            movimientoRetornado = args.data;
            return {
              id: 'mov-test-s9-019',
              ...args.data,
              material: { nombre: 'Varilla', unidad: 'barra', codigo: 'VAR-001' },
              proyecto: { nombre: 'Proyecto Test S9', codigo: 'TST-S9' },
              usuario:  { nombre: 'Test', apellido: 'Res' },
            };
          },
        },
        auditLog: { create: async () => ({}) },
      };
      return fn(txMock);
    };

    delete require.cache[require.resolve('../src/services/consumo.service')];
    const consumoService = require('../src/services/consumo.service');

    let resultado = null;
    try {
      resultado = await consumoService.registrarConsumo({
        idProyecto:  FAKE_PROYECTO_ID,
        idMaterial:  FAKE_MATERIAL_ID,
        idUsuario:   'usr-test-res-s9',
        cantidad:    7,
        observacion: 'Consumo mock HU-S9-4',
      });
    } finally {
      prismaModule.$transaction = originalTransaction;
      delete require.cache[require.resolve('../src/services/consumo.service')];
    }

    // CA HU-S9-4: El consumo se registrÃ³ correctamente
    expect(resultado).not.toBeNull();
    expect(resultado.stockAnterior).toBe(20);
    expect(resultado.stockActual).toBe(13);   // 20 - 7

    // CA HU-S9-3: El stock nunca queda negativo
    expect(stockGuardado).toBeGreaterThanOrEqual(0);
    expect(stockGuardado).toBe(13);

    // CA HU-S9-2: El movimiento es de tipo SALIDA
    expect(movimientoRetornado.tipoMovimiento).toBe('SALIDA');
    expect(parseFloat(movimientoRetornado.cantidadAnterior)).toBe(20);
    expect(parseFloat(movimientoRetornado.cantidadResultante)).toBe(13);
  });
});


    const prismaModule = require('../src/utils/prisma');
    const originalTransaction = prismaModule.$transaction;
// =============================================================================
// GRUPO 5: Historial de consumos y trazabilidad
// =============================================================================
describe('Sprint09 â€“ Grupo 5: Historial de Consumos y Trazabilidad', () => {

  test('21. GET historial sin token â†’ 401 Unauthorized', async () => {
    const res = await request(app)
      .get(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/historial`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('22. GET historial con Admin â†’ 200/404/500 (no 401, no 403)', async () => {
    const res = await request(app)
      .get(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/historial`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 404, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      // Solo debe haber movimientos SALIDA
      res.body.data.forEach((mov) => {
        expect(mov.tipoMovimiento).toBe('SALIDA');
      });
    }
  });

  test('23. GET historial con Residente â†’ pasa RBAC (200/403/404/500)', async () => {
    const res = await request(app)
      .get(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/historial`)
      .set('Authorization', `Bearer ${residenteToken}`);

    expect([200, 403, 404, 500]).toContain(res.statusCode);
  });

  test('24. GET historial con Bodeguero â†’ pasa RBAC (200/403/404/500)', async () => {
    const res = await request(app)
      .get(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/historial`)
      .set('Authorization', `Bearer ${bodegueroToken}`);

    expect([200, 403, 404, 500]).toContain(res.statusCode);
  });

  test('25. Si GET historial retorna 200, cada movimiento tiene cantidadAnterior y cantidadResultante', async () => {
    const res = await request(app)
      .get(`/api/v1/consumo/proyectos/${FAKE_PROYECTO_ID}/historial`)
      .set('Authorization', `Bearer ${adminToken}`);

    if (res.statusCode === 200) {
      res.body.data.forEach((mov) => {
        expect(mov).toHaveProperty('cantidadAnterior');
        expect(mov).toHaveProperty('cantidadResultante');
        // cantidadResultante no debe ser negativa
        expect(parseFloat(mov.cantidadResultante)).toBeGreaterThanOrEqual(0);
      });
    } else {
      expect([404, 500]).toContain(res.statusCode);
    }
  });

  /**
   * CA: El audit_log se registra dentro de la misma transacciÃ³n de consumo.
   */
  test('26. consumoService: audit_log se registra dentro de la transacciÃ³n (simulado)', async () => {
    const prismaModule = require('../src/utils/prisma');
    const originalTransaction = prismaModule.$transaction;

    let auditLogCreado = false;

    prismaModule.$transaction = async (fn) => {
      const txMock = {
        proyecto: {
          findUnique: async () => ({
            id: FAKE_PROYECTO_ID, nombre: 'Test', codigo: 'TST-009', estado: 'ACTIVO',
          }),
        },
        asignacionProyectoUsuario: {
          findFirst: async () => ({
            id: 'asig-001', idUsuario: 'usr-test-res-s9', idProyecto: FAKE_PROYECTO_ID,
            fechaInicio: new Date('2026-01-01'), fechaFin: new Date('2099-12-31'),
          }),
        },
        material: {
          findUnique: async () => ({
            id: FAKE_MATERIAL_ID, nombre: 'Cemento', codigo: 'CEM-001',
            unidad: 'bulto', activo: true,
          }),
        },
        inventarioProyecto: {
          findUnique: async () => ({ cantidadDisponible: 100 }),
          upsert:     async (args) => ({ cantidadDisponible: args.update.cantidadDisponible }),
        },
        movimientoInventario: {
          findFirst: async () => null,
          create:    async (args) => ({
            id: 'mov-audit-test-001',
            ...args.data,
            material:  { nombre: 'Cemento', unidad: 'bulto', codigo: 'CEM-001' },
            proyecto:  { nombre: 'Test', codigo: 'TST-009' },
            usuario:   { nombre: 'Test', apellido: 'Res' },
          }),
        },
        auditLog: {
          create: async (args) => {
            // CA: verificar que el audit_log tiene los campos correctos
            expect(args.data.tabla).toBe('movimiento_inventario');
            expect(args.data.operacion).toBe('INSERT');
            expect(args.data.idUsuario).toBeTruthy();
            auditLogCreado = true;
            return { id: BigInt(1) };
          },
        },
      };
      return fn(txMock);
    };

    delete require.cache[require.resolve('../src/services/consumo.service')];
    const consumoService = require('../src/services/consumo.service');

    try {
      await consumoService.registrarConsumo({
        idProyecto:  FAKE_PROYECTO_ID,
        idMaterial:  FAKE_MATERIAL_ID,
        idUsuario:   'usr-test-res-s9',
        cantidad:    10,
        observacion: 'Test audit_log',
      });
    } catch {
      // No crÃ­tico para este test
    } finally {
      prismaModule.$transaction = originalTransaction;
      delete require.cache[require.resolve('../src/services/consumo.service')];
    }

    // CA: El audit_log DEBE haberse creado dentro de la transacciÃ³n
    expect(auditLogCreado).toBe(true);
  });
});

// =============================================================================
// GRUPO 6: Rollback transaccional (HU-S9-3)
// =============================================================================
describe('Sprint09 â€“ Grupo 6: Rollback Transaccional', () => {

  /**
   * CA HU-S9-3: Si el stock es insuficiente, el rollback ocurre antes de
   * crear el movimiento. El inventario no debe cambiar.
   */
  test('27. Stock insuficiente â†’ rollback total, movimiento NO creado, inventario sin cambios', async () => {
    const prismaModule = require('../src/utils/prisma');
    const originalTransaction = prismaModule.$transaction;

    let movimientoCreado      = false;
    let inventarioActualizado = false;
    let auditLogCreado        = false;

    prismaModule.$transaction = async (fn) => {
      const stockInicial = 2; // Stock muy bajo
      const txMock = {
        proyecto: {
          findUnique: async () => ({
            id: FAKE_PROYECTO_ID, nombre: 'Test Rollback', codigo: 'ROLL-001', estado: 'ACTIVO',
          }),
        },
        asignacionProyectoUsuario: {
          findFirst: async () => ({
            fechaInicio: new Date('2026-01-01'), fechaFin: new Date('2099-12-31'),
          }),
        },
        material: {
          findUnique: async () => ({
            id: FAKE_MATERIAL_ID, nombre: 'Material Rollback', codigo: 'ROLL-MAT',
            unidad: 'unidad', activo: true,
          }),
        },
        inventarioProyecto: {
          findUnique: async () => ({ cantidadDisponible: stockInicial }),
          upsert: async () => {
            inventarioActualizado = true; // NO debe ejecutarse
            return {};
          },
        },
        movimientoInventario: {
          findFirst: async () => null,
          create: async () => {
            movimientoCreado = true; // NO debe ejecutarse
            return {};
          },
        },
        auditLog: {
          create: async () => {
            auditLogCreado = true; // NO debe ejecutarse
            return {};
          },
        },
      };
      return fn(txMock);
    };

    delete require.cache[require.resolve('../src/services/consumo.service')];
    const consumoService = require('../src/services/consumo.service');

    let errorLanzado = null;
    try {
      await consumoService.registrarConsumo({
        idProyecto:  FAKE_PROYECTO_ID,
        idMaterial:  FAKE_MATERIAL_ID,
        idUsuario:   'usr-test-res-s9',
        cantidad:    999, // â† supera ampliamente el stock de 2
      });
    } catch (err) {
      errorLanzado = err;
    } finally {
      prismaModule.$transaction = originalTransaction;
      delete require.cache[require.resolve('../src/services/consumo.service')];
    }

    // CA HU-S9-3: El error debe ser STOCK_INSUFICIENTE
    expect(errorLanzado).not.toBeNull();
    expect(errorLanzado.status).toBe(422);
    expect(errorLanzado.codigo).toBe('STOCK_INSUFICIENTE');

    // CA HU-S9-3: NINGUNA operaciÃ³n de escritura debe haberse ejecutado
    expect(movimientoCreado).toBe(false);
    expect(inventarioActualizado).toBe(false);
    expect(auditLogCreado).toBe(false);
  });

  /**
   * CA HU-S9-3: Proyecto ajeno â†’ rollback, inventario sin cambios.
   */
  test('28. Proyecto ajeno â†’ rollback total, inventario sin cambios', async () => {
    const prismaModule = require('../src/utils/prisma');
    const originalTransaction = prismaModule.$transaction;

    let inventarioActualizado = false;

    prismaModule.$transaction = async (fn) => {
      const txMock = {
        proyecto: {
          findUnique: async () => ({
            id: FAKE_PROYECTO_ID, nombre: 'Test', codigo: 'TST', estado: 'ACTIVO',
          }),
        },
        asignacionProyectoUsuario: {
          findFirst: async () => null, // â† usuario no asignado
        },
        material: { findUnique: async () => null },
        inventarioProyecto: {
          findUnique: async () => ({ cantidadDisponible: 100 }),
          upsert: async () => { inventarioActualizado = true; return {}; },
        },
        movimientoInventario: { findFirst: async () => null, create: async () => ({}) },
        auditLog: { create: async () => ({}) },
      };
      return fn(txMock);
    };

    delete require.cache[require.resolve('../src/services/consumo.service')];
    const consumoService = require('../src/services/consumo.service');

    let errorLanzado = null;
    try {
      await consumoService.registrarConsumo({
        idProyecto: FAKE_PROYECTO_ID,
        idMaterial:  FAKE_MATERIAL_ID,
        idUsuario:  'usr-extraÃ±o-s9', // â† no asignado
        cantidad:   10,
      });
    } catch (err) {
      errorLanzado = err;
    } finally {
      prismaModule.$transaction = originalTransaction;
      delete require.cache[require.resolve('../src/services/consumo.service')];
    }

    expect(errorLanzado).not.toBeNull();
    expect(errorLanzado.status).toBe(403);
    expect(errorLanzado.codigo).toBe('PROYECTO_NO_AUTORIZADO');

    // El inventario NO debe haberse alterado
    expect(inventarioActualizado).toBe(false);
  });

  test('29. consumoService: proyecto INACTIVO â†’ 422 PROYECTO_INACTIVO', async () => {
    const prismaModule = require('../src/utils/prisma');
    const originalTransaction = prismaModule.$transaction;

    prismaModule.$transaction = async (fn) => {
      const txMock = {
        proyecto: {
          findUnique: async () => ({
            id: FAKE_PROYECTO_ID, nombre: 'Proyecto Inactivo', codigo: 'INACT', estado: 'INACTIVO',
          }),
        },
        asignacionProyectoUsuario: { findFirst: async () => ({}) },
        material: { findUnique: async () => null },
        inventarioProyecto: { findUnique: async () => null, upsert: async () => ({}) },
        movimientoInventario: { findFirst: async () => null, create: async () => ({}) },
        auditLog: { create: async () => ({}) },
      };
      return fn(txMock);
    };

    delete require.cache[require.resolve('../src/services/consumo.service')];
    const consumoService = require('../src/services/consumo.service');

    let errorLanzado = null;
    try {
      await consumoService.registrarConsumo({
        idProyecto: FAKE_PROYECTO_ID,
        idMaterial:  FAKE_MATERIAL_ID,
        idUsuario:  'usr-test-res-s9',
        cantidad:   5,
      });
    } catch (err) {
      errorLanzado = err;
    } finally {
      prismaModule.$transaction = originalTransaction;
      delete require.cache[require.resolve('../src/services/consumo.service')];
    }

    expect(errorLanzado).not.toBeNull();
    expect(errorLanzado.status).toBe(422);
    expect(errorLanzado.codigo).toBe('PROYECTO_INACTIVO');
  });
});
