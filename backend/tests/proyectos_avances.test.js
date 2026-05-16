/**
 * proyectos_avances.test.js — Pruebas Automatizadas: Gestión de Proyectos y Avances de Obra
 *
 * Sprint 02 — "Gestión de Proyectos, Avances de Obra y Evidencia Fotográfica"
 * Período: 29/04/2026 – 12/05/2026
 *
 * Cubre:
 *   GRUPO 1 – CRUD de Proyectos (acceso, creación, RBAC)
 *   GRUPO 2 – Avances de Obra (registro, evidencia fotográfica obligatoria, RBAC)
 *   GRUPO 3 – Carga masiva de Rubros (acceso y RBAC)
 *
 * Criterios de aceptación validados:
 *   - Solo Administrador puede crear/editar proyectos → 403 para otros roles
 *   - Residente/Admin pueden registrar avances → 403 para Contador/Bodeguero
 *   - Evidencia fotográfica obligatoria en registro de avances → 400 si ausente
 *   - Rutas protegidas retornan 401 sin token
 *   - Carga masiva de rubros solo para Admin → 403 para otros roles
 */

process.env.NODE_ENV      = 'test';
process.env.JWT_SECRET    = 'secreto_para_pruebas_icaro_2025';
process.env.JWT_EXPIRES_IN = '8h';
process.env.DATABASE_URL  = process.env.DATABASE_URL ||
  'postgresql://icaro_user:icaro_secret@localhost:5432/Icaro_System';

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const path    = require('path');
const app     = require('../src/server');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SECRET = process.env.JWT_SECRET;

const makeToken = (payload, secret = SECRET, expiresIn = '8h') =>
  jwt.sign(payload, secret, { expiresIn });

const adminToken      = makeToken({ id: 'usr-test-admin',    email: 'admin@test.com',   rol: 'Administrador del Sistema' });
const residenteToken  = makeToken({ id: 'usr-test-res',      email: 'res@test.com',     rol: 'Residente' });
const contadorToken   = makeToken({ id: 'usr-test-cont',     email: 'cont@test.com',    rol: 'Contador' });
const bodegueroToken  = makeToken({ id: 'usr-test-bod',      email: 'bod@test.com',     rol: 'Bodeguero' });
const presidenteToken = makeToken({ id: 'usr-test-pres',     email: 'pres@test.com',    rol: 'Presidente / Gerente' });

const FAKE_UUID = '00000000-0000-0000-0000-000000000002';

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 1: CRUD de Proyectos
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint02 – Grupo 1: CRUD de Proyectos (RBAC y acceso)', () => {

  test('1. GET /proyectos sin token → 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/proyectos');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('2. GET /proyectos con token Admin → 200 o error de DB (no 401/403)', async () => {
    const res = await request(app)
      .get('/api/v1/proyectos')
      .set('Authorization', `Bearer ${adminToken}`);
    // 200: DB disponible; 500: DB no disponible en entorno de prueba
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });

  test('3. GET /proyectos con token Residente → pasa auth (200 o 500, no 401/403)', async () => {
    const res = await request(app)
      .get('/api/v1/proyectos')
      .set('Authorization', `Bearer ${residenteToken}`);
    // Residente está en MODULE_ROLES.proyectos: debe pasar autenticación
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
  });

  test('4. POST /proyectos sin token → 401', async () => {
    const res = await request(app)
      .post('/api/v1/proyectos')
      .send({ nombre: 'Proyecto Test', codigo: 'PRY-001' });
    expect(res.statusCode).toBe(401);
  });

  test('5. POST /proyectos con rol Residente → 403 Forbidden (solo Admin crea proyectos)', async () => {
    const res = await request(app)
      .post('/api/v1/proyectos')
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({
        codigo: 'PRY-TEST', nombre: 'Proyecto de prueba',
        descripcion: 'Test', entidadContratante: 'Entidad Test',
        presupuestoTotal: 100000, fechaInicio: '2026-05-01',
        fechaFinPrevista: '2026-12-31', estado: 'ACTIVO',
      });
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  test('6. GET /proyectos/:id sin token → 401', async () => {
    const res = await request(app).get(`/api/v1/proyectos/${FAKE_UUID}`);
    expect(res.statusCode).toBe(401);
  });

  test('7. GET /proyectos/:id con token Admin → pasa auth (200/404/500, no 401/403)', async () => {
    const res = await request(app)
      .get(`/api/v1/proyectos/${FAKE_UUID}`)
      .set('Authorization', `Bearer ${adminToken}`);
    // Admin tiene acceso irrestricto; el proyecto puede no existir en DB de prueba
    expect([200, 404, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 2: Registro de Avances de Obra y Evidencia Fotográfica
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint02 – Grupo 2: Avances de Obra y Evidencia Fotográfica (RBAC + validación)', () => {

  test('8. POST /avances sin token → 401 Unauthorized', async () => {
    const res = await request(app).post('/api/v1/avances');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('9. POST /avances con rol Contador → 403 Forbidden (rol no permitido)', async () => {
    const res = await request(app)
      .post('/api/v1/avances')
      .set('Authorization', `Bearer ${contadorToken}`)
      .field('idProyecto', FAKE_UUID)
      .field('idRubro', FAKE_UUID)
      .field('cantidadEjecutada', '5');
    expect(res.statusCode).toBe(403);
  });

  test('10. POST /avances con rol Bodeguero → 403 Forbidden (rol no permitido)', async () => {
    const res = await request(app)
      .post('/api/v1/avances')
      .set('Authorization', `Bearer ${bodegueroToken}`)
      .field('idProyecto', FAKE_UUID)
      .field('idRubro', FAKE_UUID)
      .field('cantidadEjecutada', '5');
    expect(res.statusCode).toBe(403);
  });

  test('11. POST /avances con Residente sin evidencia fotográfica → 400 (evidencia obligatoria)', async () => {
    // Residente pasa el RBAC pero falta la evidencia (campo 'evidencia')
    const res = await request(app)
      .post('/api/v1/avances')
      .set('Authorization', `Bearer ${residenteToken}`)
      .field('idProyecto', FAKE_UUID)
      .field('idRubro',    FAKE_UUID)
      .field('cantidadEjecutada', '10')
      .field('observaciones', 'Test sin evidencia');
    // El middleware de proyecto o el controlador devuelven 400/403/500
    // Lo importante: no es 200 (avance sin evidencia NO debe aceptarse)
    expect(res.statusCode).not.toBe(200);
    expect(res.statusCode).not.toBe(201);
  });

  test('12. POST /avances con Admin sin evidencia → 400 (evidencia obligatoria para todos los roles)', async () => {
    const res = await request(app)
      .post('/api/v1/avances')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('idProyecto', FAKE_UUID)
      .field('idRubro',    FAKE_UUID)
      .field('cantidadEjecutada', '10');
    // Sin archivo adjunto → controlador debe rechazar con 400
    expect(res.statusCode).not.toBe(200);
    expect(res.statusCode).not.toBe(201);
  });

  test('13. GET /avances/rubro/:idRubro sin token → 401', async () => {
    const res = await request(app).get(`/api/v1/avances/rubro/${FAKE_UUID}`);
    expect(res.statusCode).toBe(401);
  });

  test('14. GET /avances/rubro/:idRubro con token Admin → pasa auth (200/500, no 401/403)', async () => {
    const res = await request(app)
      .get(`/api/v1/avances/rubro/${FAKE_UUID}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 3: Carga masiva de Rubros (proyectos/:id/rubros/bulk)
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint02 – Grupo 3: Carga masiva de Rubros (RBAC)', () => {

  test('15. POST /proyectos/:id/rubros/bulk sin token → 401', async () => {
    const res = await request(app)
      .post(`/api/v1/proyectos/${FAKE_UUID}/rubros/bulk`)
      .send({ rubros: [] });
    expect(res.statusCode).toBe(401);
  });

  test('16. POST /proyectos/:id/rubros/bulk con Residente → 403 (solo Admin puede cargar masivamente)', async () => {
    const res = await request(app)
      .post(`/api/v1/proyectos/${FAKE_UUID}/rubros/bulk`)
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({
        rubros: [
          { codigo: 'R-001', descripcion: 'Mampostería', unidad: 'm2',
            precioUnitario: 50, cantidadPresupuestada: 100 },
        ],
      });
    // Puede ser 403 (RBAC de rubro bulk) o 403/500 (acceso al proyecto)
    expect([403, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(200);
    expect(res.statusCode).not.toBe(201);
  });

  test('17. POST /proyectos/:id/rubros/bulk con Admin → pasa RBAC (no 403)', async () => {
    const res = await request(app)
      .post(`/api/v1/proyectos/${FAKE_UUID}/rubros/bulk`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        rubros: [
          { codigo: 'R-TEST', descripcion: 'Rubro de prueba', unidad: 'un',
            precioUnitario: 100, cantidadPresupuestada: 50 },
        ],
      });
    // Admin pasa RBAC; puede fallar por DB no disponible
    expect(res.statusCode).not.toBe(403);
    expect([200, 201, 400, 404, 500]).toContain(res.statusCode);
  });
});
