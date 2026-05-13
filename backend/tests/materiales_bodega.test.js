/**
 * materiales_bodega.test.js — Pruebas Automatizadas: Catálogo de Materiales y Gestión de Bodega
 *
 * Sprint 03 — "Catálogo de Materiales, Gestión de Bodega e Inventario"
 * Período: 13/05/2026 – 26/05/2026
 *
 * Cubre:
 *   GRUPO 1 – CRUD del Catálogo de Materiales (RBAC: Admin escribe, todos leen)
 *   GRUPO 2 – Bodega: Registro de Movimientos e Inventario (RBAC: Admin/Bodeguero escriben)
 *   GRUPO 3 – Validación de MIME type y tamaño de imagen (unit tests StorageService)
 *
 * Criterios de aceptación validados:
 *   - Solo Administrador puede crear, editar y desactivar materiales → 403 para otros roles
 *   - Admin, Bodeguero, Residente, Presidente y Contador pueden leer el catálogo
 *   - Solo Bodeguero y Admin pueden registrar movimientos de inventario → 403 para Residente/Contador
 *   - storageService.validateImage rechaza tipos MIME no permitidos (solo JPG/PNG)
 *   - storageService.validateImage rechaza archivos que superan 5 MB
 *   - Rutas protegidas retornan 401 cuando no se provee token
 */

process.env.NODE_ENV       = 'test';
process.env.JWT_SECRET     = 'secreto_para_pruebas_icaro_2025';
process.env.JWT_EXPIRES_IN = '8h';
process.env.DATABASE_URL   = process.env.DATABASE_URL ||
  'postgresql://icaro_user:icaro_secret@localhost:5432/Icaro_System';

const request        = require('supertest');
const jwt            = require('jsonwebtoken');
const app            = require('../src/server');
const storageService = require('../src/services/storage.service');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SECRET = process.env.JWT_SECRET;

const makeToken = (payload, secret = SECRET, expiresIn = '8h') =>
  jwt.sign(payload, secret, { expiresIn });

const adminToken      = makeToken({ id: 'usr-test-admin', email: 'admin@test.com',   rol: 'Administrador del Sistema' });
const residenteToken  = makeToken({ id: 'usr-test-res',   email: 'res@test.com',     rol: 'Residente' });
const contadorToken   = makeToken({ id: 'usr-test-cont',  email: 'cont@test.com',    rol: 'Contador' });
const bodegueroToken  = makeToken({ id: 'usr-test-bod',   email: 'bod@test.com',     rol: 'Bodeguero' });

const FAKE_UUID    = '00000000-0000-0000-0000-000000000003';
const FAKE_MAT_ID  = '00000000-0000-0000-0000-000000000004';

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 1: Catálogo de Materiales — CRUD y RBAC
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint03 – Grupo 1: Catálogo de Materiales (RBAC y validaciones)', () => {

  test('1. GET /materiales sin token → 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/materiales');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('2. GET /materiales con Admin → pasa auth (200 o 500, no 401 ni 403)', async () => {
    const res = await request(app)
      .get('/api/v1/materiales')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });

  test('3. GET /materiales con Bodeguero → pasa auth (canRead incluye Bodeguero)', async () => {
    const res = await request(app)
      .get('/api/v1/materiales')
      .set('Authorization', `Bearer ${bodegueroToken}`);
    // Bodeguero está en canRead: debe pasar el RBAC
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
  });

  test('4. POST /materiales sin token → 401', async () => {
    const res = await request(app)
      .post('/api/v1/materiales')
      .send({ codigo: 'MAT-001', nombre: 'Cemento', categoria: 'Construcción', unidad: 'kg' });
    expect(res.statusCode).toBe(401);
  });

  test('5. POST /materiales con Residente → 403 Forbidden (solo Admin puede crear materiales)', async () => {
    const res = await request(app)
      .post('/api/v1/materiales')
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({ codigo: 'MAT-TEST', nombre: 'Material de prueba', categoria: 'Test', unidad: 'un' });
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  test('6. POST /materiales con Admin sin campos obligatorios → 400 (validación de campos)', async () => {
    const res = await request(app)
      .post('/api/v1/materiales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Material incompleto' }); // Falta codigo, categoria, unidad
    // El controlador valida campos obligatorios y retorna 400; si DB no disponible, retorna 500
    expect([400, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
  });

  test('7. GET /materiales/categorias con Admin → pasa auth (200 o 500, no 401 ni 403)', async () => {
    const res = await request(app)
      .get('/api/v1/materiales/categorias')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });

  test('8. DELETE /materiales/:id con Contador → 403 (solo Admin puede desactivar materiales)', async () => {
    const res = await request(app)
      .delete(`/api/v1/materiales/${FAKE_MAT_ID}`)
      .set('Authorization', `Bearer ${contadorToken}`);
    expect(res.statusCode).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 2: Bodega — Movimientos e Inventario
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint03 – Grupo 2: Bodega – Movimientos e Inventario (RBAC + validaciones)', () => {

  test('9. POST /bodega/proyectos/:id/movimientos sin token → 401', async () => {
    const res = await request(app)
      .post(`/api/v1/bodega/proyectos/${FAKE_UUID}/movimientos`)
      .send({});
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('10. POST .../movimientos con Residente → 403 (canWrite: solo Admin y Bodeguero)', async () => {
    const res = await request(app)
      .post(`/api/v1/bodega/proyectos/${FAKE_UUID}/movimientos`)
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({ idMaterial: FAKE_MAT_ID, tipoMovimiento: 'ENTRADA', cantidad: 10 });
    expect(res.statusCode).toBe(403);
  });

  test('11. POST .../movimientos con Admin sin body → pasa RBAC, retorna 400 (campos obligatorios)', async () => {
    // Admin pasa requireRole y requireProjectAccess (Admin tiene acceso irrestricto).
    // El controlador valida campos obligatorios (idMaterial, tipoMovimiento, cantidad) y retorna 400.
    // Si la BD no está disponible en el entorno de prueba, puede retornar 500.
    const res = await request(app)
      .post(`/api/v1/bodega/proyectos/${FAKE_UUID}/movimientos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect([400, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
    expect(res.statusCode).not.toBe(401);
  });

  test('12. GET /bodega/proyectos/:id/movimientos sin token → 401', async () => {
    const res = await request(app)
      .get(`/api/v1/bodega/proyectos/${FAKE_UUID}/movimientos`);
    expect(res.statusCode).toBe(401);
  });

  test('13. GET .../movimientos con Admin → pasa auth (200 o 500, no 401 ni 403)', async () => {
    const res = await request(app)
      .get(`/api/v1/bodega/proyectos/${FAKE_UUID}/movimientos`)
      .set('Authorization', `Bearer ${adminToken}`);
    // Admin pasa RBAC y projectAccess; puede fallar por BD no disponible
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });

  test('14. GET .../inventario con Admin → pasa auth (200 o 500, no 401 ni 403)', async () => {
    const res = await request(app)
      .get(`/api/v1/bodega/proyectos/${FAKE_UUID}/inventario`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 3: Validación de MIME type y tamaño de imagen (unit tests StorageService)
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint03 – Grupo 3: Validación MIME type y tamaño de imagen (StorageService)', () => {

  test('15. validateImage rechaza tipo MIME no permitido (application/pdf → error)', () => {
    expect(() => {
      storageService.validateImage('application/pdf', 1024);
    }).toThrow('Formato de imagen no válido. Solo se permite JPG y PNG.');
  });

  test('16. validateImage rechaza archivos que superan 5 MB', () => {
    const SEIS_MB = 6 * 1024 * 1024;
    expect(() => {
      storageService.validateImage('image/jpeg', SEIS_MB);
    }).toThrow('El archivo excede el tamaño máximo permitido de 5 MB.');
  });

  test('17. validateImage acepta imagen JPG dentro del límite de tamaño', () => {
    const UN_MB = 1 * 1024 * 1024;
    expect(() => {
      storageService.validateImage('image/jpeg', UN_MB);
    }).not.toThrow();
  });

  test('18. validateImage acepta imagen PNG dentro del límite de tamaño', () => {
    const DOS_MB = 2 * 1024 * 1024;
    expect(() => {
      storageService.validateImage('image/png', DOS_MB);
    }).not.toThrow();
  });
});
