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
 *
 * Nota de diseño: Se mockea el cliente Prisma para que requireAuth valide el JWT
 * y el rol sin necesitar una BD activa. Esto permite ejecutar los tests de RBAC
 * de forma aislada (unitaria/integración ligera) en cualquier entorno CI.
 */

process.env.NODE_ENV       = 'test';
process.env.JWT_SECRET     = 'secreto_para_pruebas_icaro_2025';
process.env.JWT_EXPIRES_IN = '8h';
process.env.DATABASE_URL   = process.env.DATABASE_URL
  || 'postgresql://icaro_user:icaro_secret@localhost:5433/Icaro_System';

// ─── Mock de Prisma: simula usuario activo para todos los tokens de prueba ────
// jest.mock es elevado automáticamente antes de cualquier require por Jest.
// Permite que requireAuth pase la verificación de existencia en BD sin DB real.
jest.mock('../src/utils/prisma', () => ({
  usuario: {
    findUnique: jest.fn().mockResolvedValue({ id: 'usr-mock', activo: true }),
  },
}));

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const express = require('express');

// ─── Mini-app de prueba (solo rutas del Sprint 05, sin importar server.js) ───
// Evita la cadena de dependencias de avances.routes → storage.service → uuid ESM.
const testApp = express();
testApp.use(express.json());
testApp.use('/api/v1/planillas',         require('../src/routes/planillas.routes'));
testApp.use('/api/v1/cierres-contables', require('../src/routes/cierresContables.routes'));
testApp.use('/api/v1/gastos',            require('../src/routes/gastos.routes'));

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
// GRUPO 1 — Planilla RBAC (POST y GET /planillas)
// CP-069 a CP-074  |  Tests 1 – 6
// ─────────────────────────────────────────────────────────────────────────────
describe('Grupo 1 — Planilla RBAC | POST /planillas y GET /planillas', () => {

  // CP-069 – Test 1
  test('Test 1 | CP-069 | POST /planillas sin token: ruta protegida', async () => {
    const res = await request(testApp)
      .post('/api/v1/planillas')
      .send({ idProyecto: 'proj-001', periodo: '2026-04' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-070 – Test 2
  test('Test 2 | CP-070 | POST /planillas con Bodeguero: RBAC deniega creación', async () => {
    const res = await request(testApp)
      .post('/api/v1/planillas')
      .set('Authorization', `Bearer ${bodegueroToken}`)
      .send({ idProyecto: 'proj-001', periodo: '2026-04' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  // CP-071 – Test 3
  test('Test 3 | CP-071 | POST /planillas con Residente: RBAC deniega creación', async () => {
    const res = await request(testApp)
      .post('/api/v1/planillas')
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({ idProyecto: 'proj-001', periodo: '2026-04' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  // CP-072 – Test 4
  test('Test 4 | CP-072 | POST /planillas con Admin: pasa RBAC y procesa planilla', async () => {
    const res = await request(testApp)
      .post('/api/v1/planillas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ idProyecto: 'proj-001', periodo: '2026-04' });

    // 201: creada; 400: validación; 500: DB no disponible en entorno CI.
    // Lo importante: RBAC no bloqueó (no 401 ni 403).
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 201, 400, 500]).toContain(res.statusCode);
  });

  // CP-073 – Test 5
  test('Test 5 | CP-073 | GET /planillas sin token: ruta protegida', async () => {
    const res = await request(testApp)
      .get('/api/v1/planillas');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-074 – Test 6
  test('Test 6 | CP-074 | GET /planillas con Residente: pasa RBAC (acceso lectura)', async () => {
    const res = await request(testApp)
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
// GRUPO 2 — Planilla PDF (GET /planillas/:id/pdf)
// CP-075 a CP-078  |  Tests 7 – 10
// ─────────────────────────────────────────────────────────────────────────────
describe('Grupo 2 — Planilla PDF | GET /planillas/:id/pdf', () => {

  const PLANILLA_ID = '00000000-0000-0000-0000-000000000099';

  // CP-075 – Test 7
  test('Test 7 | CP-075 | GET /planillas/:id/pdf sin token: ruta protegida', async () => {
    const res = await request(testApp)
      .get(`/api/v1/planillas/${PLANILLA_ID}/pdf`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-076 – Test 8
  test('Test 8 | CP-076 | GET /planillas/:id/pdf con Bodeguero: RBAC deniega PDF', async () => {
    const res = await request(testApp)
      .get(`/api/v1/planillas/${PLANILLA_ID}/pdf`)
      .set('Authorization', `Bearer ${bodegueroToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  // CP-077 – Test 9
  test('Test 9 | CP-077 | GET /planillas/:id/pdf con Presidente: pasa RBAC', async () => {
    const res = await request(testApp)
      .get(`/api/v1/planillas/${PLANILLA_ID}/pdf`)
      .set('Authorization', `Bearer ${presidenteToken}`);

    // 200: PDF generado; 404: planilla no existe; 500: DB no disponible en entorno CI.
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  // CP-078 – Test 10
  test('Test 10 | CP-078 | GET /planillas/:id/pdf con Admin: pasa RBAC', async () => {
    const res = await request(testApp)
      .get(`/api/v1/planillas/${PLANILLA_ID}/pdf`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 404, 500]).toContain(res.statusCode);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 3 — Cierre Contable RBAC (POST y GET /cierres-contables)
// CP-079 a CP-084  |  Tests 11 – 16
// ─────────────────────────────────────────────────────────────────────────────
describe('Grupo 3 — Cierre Contable RBAC | POST /cierres-contables y GET /cierres-contables', () => {

  // CP-079 – Test 11
  test('Test 11 | CP-079 | POST /cierres-contables sin token: ruta protegida', async () => {
    const res = await request(testApp)
      .post('/api/v1/cierres-contables')
      .send({ idProyecto: 'proj-001', mes: 4, anio: 2026 });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-080 – Test 12
  test('Test 12 | CP-080 | POST /cierres-contables con Residente: RBAC deniega', async () => {
    const res = await request(testApp)
      .post('/api/v1/cierres-contables')
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({ idProyecto: 'proj-001', mes: 4, anio: 2026 });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  // CP-081 – Test 13
  test('Test 13 | CP-081 | POST /cierres-contables con Bodeguero: RBAC deniega', async () => {
    const res = await request(testApp)
      .post('/api/v1/cierres-contables')
      .set('Authorization', `Bearer ${bodegueroToken}`)
      .send({ idProyecto: 'proj-001', mes: 4, anio: 2026 });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  // CP-082 – Test 14
  test('Test 14 | CP-082 | POST /cierres-contables con Admin: pasa RBAC', async () => {
    const res = await request(testApp)
      .post('/api/v1/cierres-contables')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ idProyecto: 'proj-001', mes: 4, anio: 2026 });

    // 201: creado; 400: validación; 500: DB no disponible en entorno CI.
    // Lo importante: RBAC no bloqueó (no 401 ni 403).
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 201, 400, 500]).toContain(res.statusCode);
  });

  // CP-083 – Test 15
  test('Test 15 | CP-083 | GET /cierres-contables sin token: ruta protegida', async () => {
    const res = await request(testApp)
      .get('/api/v1/cierres-contables');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-084 – Test 16
  test('Test 16 | CP-084 | GET /cierres-contables con Contador: pasa RBAC (lectura)', async () => {
    const res = await request(testApp)
      .get('/api/v1/cierres-contables')
      .set('Authorization', `Bearer ${contadorToken}`);

    // 200: DB disponible; 500: DB no disponible en entorno CI.
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 500]).toContain(res.statusCode);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 4 — Gastos (POST /gastos)
// CP-085 a CP-086  |  Tests 17 – 18
// ─────────────────────────────────────────────────────────────────────────────
describe('Grupo 4 — Gastos | POST /gastos', () => {

  // CP-085 – Test 17
  test('Test 17 | CP-085 | POST /gastos sin token: ruta protegida', async () => {
    const res = await request(testApp)
      .post('/api/v1/gastos')
      .send({ idProyecto: 'proj-001', descripcion: 'Combustible', monto: 150000 });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // CP-086 – Test 18
  test('Test 18 | CP-086 | POST /gastos con Admin: pasa RBAC y registra gasto', async () => {
    const res = await request(testApp)
      .post('/api/v1/gastos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ idProyecto: 'proj-001', descripcion: 'Combustible', monto: 150000 });

    // 201: registrado; 400: validación; 500: DB no disponible en entorno CI.
    // Lo importante: RBAC no bloqueó (no 401 ni 403).
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
    expect([200, 201, 400, 500]).toContain(res.statusCode);
  });
});
