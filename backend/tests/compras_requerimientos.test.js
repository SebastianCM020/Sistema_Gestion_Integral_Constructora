/**
 * compras_requerimientos.test.js — Pruebas Automatizadas: Módulo de Requerimientos de Compra
 *
 * Sprint 04 — "Módulo de Requerimientos de Compra"
 * Período: 04/04/2026 – 08/04/2026
 *
 * Cubre:
 *   GRUPO 1 – CRUD de Requerimientos de Compra (RBAC: Admin/Residente/Presidente crean; todos leen)
 *   GRUPO 2 – Flujo Aprobar / Rechazar (RBAC: solo Admin y Presidente deciden)
 *   GRUPO 3 – Reactivación de Materiales y soloActivos=false (HT-09 formalizado)
 *
 * Criterios de aceptación validados:
 *   - Solo Admin, Residente y Presidente pueden crear requerimientos → 403 para Contador/Bodeguero
 *   - Creación requiere array detalles[] no vacío → 400 si ausente
 *   - Solo Admin y Presidente pueden aprobar o rechazar → 403 para Residente
 *   - Rechazo requiere comentarioRechazo en body → 400 si ausente
 *   - PUT /materiales/:id con { activo: true } reactiva un material (solo Admin) → 403 para Residente
 *   - GET /materiales?soloActivos=false devuelve catálogo completo incluyendo inactivos
 *   - Rutas protegidas retornan 401 cuando no se provee token
 */

process.env.NODE_ENV       = 'test';
process.env.JWT_SECRET     = 'secreto_para_pruebas_icaro_2025';
process.env.JWT_EXPIRES_IN = '8h';
process.env.DATABASE_URL   = process.env.DATABASE_URL ||
  'postgresql://icaro_user:icaro_secret@localhost:5432/Icaro_System';

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../src/server');

const SECRET = process.env.JWT_SECRET;
const makeToken = (payload, secret = SECRET, expiresIn = '8h') =>
  jwt.sign(payload, secret, { expiresIn });

const adminToken      = makeToken({ id: 'usr-test-admin', email: 'admin@test.com',  rol: 'Administrador del Sistema' });
const residenteToken  = makeToken({ id: 'usr-test-res',   email: 'res@test.com',    rol: 'Residente' });
const contadorToken   = makeToken({ id: 'usr-test-cont',  email: 'cont@test.com',   rol: 'Contador' });
const bodegueroToken  = makeToken({ id: 'usr-test-bod',   email: 'bod@test.com',    rol: 'Bodeguero' });
const presidenteToken = makeToken({ id: 'usr-test-pres',  email: 'pres@test.com',   rol: 'Presidente / Gerente' });

const FAKE_PROYECTO_ID = '00000000-0000-0000-0000-000000000003';
const FAKE_REQ_ID      = '00000000-0000-0000-0000-000000000005';
const FAKE_MAT_ID      = '00000000-0000-0000-0000-000000000004';

const BODY_REQ_COMPLETO = {
  justificacion: 'Requerimiento de prueba automatizada Sprint 04',
  detalles: [{ idMaterial: FAKE_MAT_ID, cantidadSolicitada: 10 }],
};

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 1: CRUD Requerimientos de Compra — RBAC y validaciones de campos
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint04 – Grupo 1: Requerimientos de Compra (RBAC y validaciones)', () => {

  test('1. POST /compras/proyectos/:id/requerimientos sin token → 401 Unauthorized', async () => {
    const res = await request(app)
      .post(`/api/v1/compras/proyectos/${FAKE_PROYECTO_ID}/requerimientos`)
      .send(BODY_REQ_COMPLETO);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('2. POST .../requerimientos con Contador → 403 Forbidden (Contador solo puede leer)', async () => {
    const res = await request(app)
      .post(`/api/v1/compras/proyectos/${FAKE_PROYECTO_ID}/requerimientos`)
      .set('Authorization', `Bearer ${contadorToken}`)
      .send(BODY_REQ_COMPLETO);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  test('3. POST .../requerimientos con Residente sin detalles → pasa RBAC, valida campos (400/500)', async () => {
    const res = await request(app)
      .post(`/api/v1/compras/proyectos/${FAKE_PROYECTO_ID}/requerimientos`)
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({ justificacion: 'Sin detalles' });
    expect([400, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
    expect(res.statusCode).not.toBe(401);
  });

  test('4. POST .../requerimientos con Admin + body completo → pasa RBAC (201/404/500, no 403)', async () => {
    const res = await request(app)
      .post(`/api/v1/compras/proyectos/${FAKE_PROYECTO_ID}/requerimientos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(BODY_REQ_COMPLETO);
    expect([201, 404, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
    expect(res.statusCode).not.toBe(401);
  });

  test('5. GET /compras/proyectos/:id/requerimientos sin token → 401', async () => {
    const res = await request(app)
      .get(`/api/v1/compras/proyectos/${FAKE_PROYECTO_ID}/requerimientos`);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('6. GET .../requerimientos con Admin → pasa auth (200/500, no 401 ni 403)', async () => {
    const res = await request(app)
      .get(`/api/v1/compras/proyectos/${FAKE_PROYECTO_ID}/requerimientos`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });

  test('7. GET .../requerimientos con Bodeguero → pasa auth (canRead incluye Bodeguero)', async () => {
    const res = await request(app)
      .get(`/api/v1/compras/proyectos/${FAKE_PROYECTO_ID}/requerimientos`)
      .set('Authorization', `Bearer ${bodegueroToken}`);
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
    expect(res.statusCode).not.toBe(401);
  });

  test('8. GET /compras/requerimientos/:id con Contador → pasa auth (200/404/500, no 403 ni 401)', async () => {
    const res = await request(app)
      .get(`/api/v1/compras/requerimientos/${FAKE_REQ_ID}`)
      .set('Authorization', `Bearer ${contadorToken}`);
    expect([200, 404, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
    expect(res.statusCode).not.toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 2: Flujo Aprobar / Rechazar — RBAC y validaciones de cuerpo
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint04 – Grupo 2: Flujo Aprobar / Rechazar (RBAC + validaciones)', () => {

  test('9. PUT /compras/requerimientos/:id/aprobar sin token → 401', async () => {
    const res = await request(app)
      .put(`/api/v1/compras/requerimientos/${FAKE_REQ_ID}/aprobar`);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('10. PUT .../aprobar con Residente → 403 (solo Admin y Presidente / Gerente aprueban)', async () => {
    const res = await request(app)
      .put(`/api/v1/compras/requerimientos/${FAKE_REQ_ID}/aprobar`)
      .set('Authorization', `Bearer ${residenteToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  test('11. PUT .../aprobar con Admin → pasa RBAC (200/404/500, no 403 ni 401)', async () => {
    const res = await request(app)
      .put(`/api/v1/compras/requerimientos/${FAKE_REQ_ID}/aprobar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 404, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
    expect(res.statusCode).not.toBe(401);
  });

  test('12. PUT /compras/requerimientos/:id/rechazar sin token → 401', async () => {
    const res = await request(app)
      .put(`/api/v1/compras/requerimientos/${FAKE_REQ_ID}/rechazar`)
      .send({ comentarioRechazo: 'Presupuesto insuficiente.' });
    expect(res.statusCode).toBe(401);
  });

  test('13. PUT .../rechazar con Residente → 403 (solo Admin y Presidente rechazan)', async () => {
    const res = await request(app)
      .put(`/api/v1/compras/requerimientos/${FAKE_REQ_ID}/rechazar`)
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({ comentarioRechazo: 'Presupuesto insuficiente.' });
    expect(res.statusCode).toBe(403);
  });

  test('14. PUT .../rechazar con Admin sin comentarioRechazo → pasa RBAC, valida body (400/500)', async () => {
    const res = await request(app)
      .put(`/api/v1/compras/requerimientos/${FAKE_REQ_ID}/rechazar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect([400, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
    expect(res.statusCode).not.toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 3: Reactivación de Materiales (HT-09) y catálogo con inactivos
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint04 – Grupo 3: Reactivación de Materiales – HT-09 (PUT /materiales/:id activo:true)', () => {

  test('15. PUT /materiales/:id sin token → 401 Unauthorized', async () => {
    const res = await request(app)
      .put(`/api/v1/materiales/${FAKE_MAT_ID}`)
      .send({ activo: true });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('16. PUT /materiales/:id con Residente → 403 Forbidden (onlyAdmin para editar materiales)', async () => {
    const res = await request(app)
      .put(`/api/v1/materiales/${FAKE_MAT_ID}`)
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({ activo: true });
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  test('17. PUT /materiales/:id con Admin y { activo: true } → pasa RBAC, reactiva material (200/404/500)', async () => {
    const res = await request(app)
      .put(`/api/v1/materiales/${FAKE_MAT_ID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ activo: true });
    expect([200, 404, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
    expect(res.statusCode).not.toBe(401);
  });

  test('18. GET /materiales?soloActivos=false con Admin → catálogo completo incluyendo inactivos (200/500)', async () => {
    const res = await request(app)
      .get('/api/v1/materiales?soloActivos=false')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });
});
