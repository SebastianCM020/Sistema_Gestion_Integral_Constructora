/**
 * planilla_contable.test.js — Sprint 05
 * Módulos probados: Planilla Mensual de Obra, Cierre Contable Mensual, Gastos
 *
 * Documento de referencia: Sprint_05_Informe_Pruebas_ICARO.docx (INF-PRU-SPR-05)
 * Código:  INF-PRU-SPR-05 | Versión: 1.0 | Fecha: 13/05/2026
 *
 * Casos cubiertos: CP-069 – CP-086 (18 casos / 100% PASS)
 *
 *   Grupo 1 — Planilla RBAC         (CP-069 – CP-074): POST y GET /planillas
 *   Grupo 2 — Planilla PDF          (CP-075 – CP-078): GET /planillas/:id/pdf
 *   Grupo 3 — Cierre Contable RBAC  (CP-079 – CP-084): POST y GET /cierres-contables
 *   Grupo 4 — Gastos                (CP-085 – CP-086): POST /gastos
 *
 * Suite acumulada del proyecto al cierre Sprint 05:
 *   Sprint 01: CP-001–CP-015 (15) | Sprint 02: CP-016–CP-032 (17)
 *   Sprint 03: CP-033–CP-050 (18) | Sprint 04: CP-051–CP-068 (18)
 *   Sprint 05: CP-069–CP-086 (18) | TOTAL: 86 pruebas
 */

process.env.NODE_ENV      = 'test';
process.env.JWT_SECRET    = 'secreto_para_pruebas_icaro_2025';
process.env.JWT_EXPIRES_IN = '8h';
process.env.DATABASE_URL  = process.env.DATABASE_URL
  || 'postgresql://icaro_user:icaro_secret@localhost:5432/Icaro_System';

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../src/server');

// ─── Helpers para generar tokens de prueba ────────────────────────────────────
const SECRET = process.env.JWT_SECRET;

const makeToken = (payload, secret = SECRET, expiresIn = '8h') =>
  jwt.sign(payload, secret, { expiresIn });

const adminToken      = makeToken({ id: 'usr-test-admin', email: 'admin@test.com',  rol: 'Administrador del Sistema' });
const residenteToken  = makeToken({ id: 'usr-test-res',   email: 'res@test.com',    rol: 'Residente' });
const contadorToken   = makeToken({ id: 'usr-test-cont',  email: 'cont@test.com',   rol: 'Contador' });
const bodegueroToken  = makeToken({ id: 'usr-test-bod',   email: 'bod@test.com',    rol: 'Bodeguero' });
const presidenteToken = makeToken({ id: 'usr-test-pres',  email: 'pres@test.com',   rol: 'Presidente / Gerente' });

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 1 — Planilla Mensual: RBAC sobre POST y GET /planillas
// CP-069 a CP-074
// ─────────────────────────────────────────────────────────────────────────────
describe('CP-069–CP-074 | Planilla Mensual — RBAC (POST y GET /planillas)', () => {

  // CP-069
  test('CP-069 | POST /planillas sin token → 401 con campo error', async () => {
    const res = await request(app)
      .post('/api/v1/planillas')
      .send({ idProyecto: 'proj-001', periodo: '2026-04' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-070
  test('CP-070 | POST /planillas con Bodeguero → 403 RBAC deniega creación', async () => {
    const res = await request(app)
      .post('/api/v1/planillas')
      .set('Authorization', `Bearer ${bodegueroToken}`)
      .send({ idProyecto: 'proj-001', periodo: '2026-04' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  // CP-071
  test('CP-071 | POST /planillas con Residente → 403 RBAC deniega creación', async () => {
    const res = await request(app)
      .post('/api/v1/planillas')
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({ idProyecto: 'proj-001', periodo: '2026-04' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  // CP-072
  test('CP-072 | POST /planillas con Admin → pasa RBAC (no 401 ni 403)', async () => {
    const res = await request(app)
      .post('/api/v1/planillas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ idProyecto: 'proj-001', periodo: '2026-04' });

    // 201: creada; 400: validación; 500: DB no disponible.
    // Lo importante: RBAC no bloqueó.
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 201, 400, 500]).toContain(res.statusCode);
  });

  // CP-073
  test('CP-073 | GET /planillas sin token → 401', async () => {
    const res = await request(app)
      .get('/api/v1/planillas');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-074
  test('CP-074 | GET /planillas con Residente → pasa RBAC (acceso lectura)', async () => {
    const res = await request(app)
      .get('/api/v1/planillas')
      .set('Authorization', `Bearer ${residenteToken}`);

    // 200: DB disponible; 500: DB no disponible en entorno CI.
    // Lo importante: el RBAC no bloqueó (no 401 ni 403).
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 500]).toContain(res.statusCode);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 2 — Planilla Mensual: Generación de PDF
// CP-075 a CP-078
// ─────────────────────────────────────────────────────────────────────────────
describe('CP-075–CP-078 | Planilla Mensual — Generación de PDF (GET /planillas/:id/pdf)', () => {

  const PLANILLA_ID = '00000000-0000-0000-0000-000000000099';

  // CP-075
  test('CP-075 | GET /planillas/:id/pdf sin token → 401', async () => {
    const res = await request(app)
      .get(`/api/v1/planillas/${PLANILLA_ID}/pdf`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-076
  test('CP-076 | GET /planillas/:id/pdf con Bodeguero → 403 RBAC deniega PDF', async () => {
    const res = await request(app)
      .get(`/api/v1/planillas/${PLANILLA_ID}/pdf`)
      .set('Authorization', `Bearer ${bodegueroToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  // CP-077
  test('CP-077 | GET /planillas/:id/pdf con Presidente → pasa RBAC (no 401 ni 403)', async () => {
    const res = await request(app)
      .get(`/api/v1/planillas/${PLANILLA_ID}/pdf`)
      .set('Authorization', `Bearer ${presidenteToken}`);

    // 200: PDF generado; 404: planilla no existe; 500: DB no disponible.
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  // CP-078
  test('CP-078 | GET /planillas/:id/pdf con Admin → pasa RBAC (no 401 ni 403)', async () => {
    const res = await request(app)
      .get(`/api/v1/planillas/${PLANILLA_ID}/pdf`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 404, 500]).toContain(res.statusCode);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 3 — Cierre Contable Mensual: RBAC sobre POST y GET /cierres-contables
// CP-079 a CP-084
// ─────────────────────────────────────────────────────────────────────────────
describe('CP-079–CP-084 | Cierre Contable — RBAC (POST y GET /cierres-contables)', () => {

  // CP-079
  test('CP-079 | POST /cierres-contables sin token → 401', async () => {
    const res = await request(app)
      .post('/api/v1/cierres-contables')
      .send({ idProyecto: 'proj-001', mes: 4, anio: 2026 });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-080
  test('CP-080 | POST /cierres-contables con Residente → 403 RBAC deniega', async () => {
    const res = await request(app)
      .post('/api/v1/cierres-contables')
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({ idProyecto: 'proj-001', mes: 4, anio: 2026 });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  // CP-081
  test('CP-081 | POST /cierres-contables con Bodeguero → 403 RBAC deniega', async () => {
    const res = await request(app)
      .post('/api/v1/cierres-contables')
      .set('Authorization', `Bearer ${bodegueroToken}`)
      .send({ idProyecto: 'proj-001', mes: 4, anio: 2026 });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  // CP-082
  test('CP-082 | POST /cierres-contables con Admin → pasa RBAC (no 401 ni 403)', async () => {
    const res = await request(app)
      .post('/api/v1/cierres-contables')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ idProyecto: 'proj-001', mes: 4, anio: 2026 });

    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 201, 400, 500]).toContain(res.statusCode);
  });

  // CP-083
  test('CP-083 | GET /cierres-contables sin token → 401', async () => {
    const res = await request(app)
      .get('/api/v1/cierres-contables');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-084
  test('CP-084 | GET /cierres-contables con Contador → pasa RBAC (acceso lectura)', async () => {
    const res = await request(app)
      .get('/api/v1/cierres-contables')
      .set('Authorization', `Bearer ${contadorToken}`);

    // 200: DB disponible; 500: DB no disponible en entorno CI.
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 500]).toContain(res.statusCode);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 4 — Gastos operativos del cierre contable
// CP-085 a CP-086
// ─────────────────────────────────────────────────────────────────────────────
describe('CP-085–CP-086 | Gastos Operativos — RBAC (POST /gastos)', () => {

  // CP-085
  test('CP-085 | POST /gastos sin token → 401', async () => {
    const res = await request(app)
      .post('/api/v1/gastos')
      .send({ idProyecto: 'proj-001', descripcion: 'Combustible', monto: 150000 });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-086
  test('CP-086 | POST /gastos con Admin → pasa RBAC (no 401 ni 403)', async () => {
    const res = await request(app)
      .post('/api/v1/gastos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ idProyecto: 'proj-001', descripcion: 'Combustible', monto: 150000 });

    // 201: registrado; 400: validación; 500: DB no disponible.
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 201, 400, 500]).toContain(res.statusCode);
  });
});
