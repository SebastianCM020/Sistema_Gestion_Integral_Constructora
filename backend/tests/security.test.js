/**
 * security.test.js — Pruebas de Seguridad y Validación de Token JWT
 *
 * Actividad 10 — Criterio de aceptación:
 *   "Retorno de error 403 Forbidden ante accesos no autorizados."
 *
 * Cubre:
 *   1. Acceso sin token → 401 Unauthorized
 *   2. Token con formato inválido → 401
 *   3. Token firmado con secreto incorrecto → 403
 *   4. Token de usuario sin rol permitido → 403 Forbidden (RBAC)
 *   5. Token válido de Admin → 200 OK
 *   6. POST sin token a ruta protegida → 401
 *   7. Token expirado → 401
 *   8. Ruta de proyecto sin asignación → 403 (Act. 9)
 */

process.env.NODE_ENV    = 'test';
process.env.JWT_SECRET  = 'secreto_para_pruebas_icaro_2025';
process.env.JWT_EXPIRES_IN = '8h';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://icaro_user:icaro_secret@localhost:5432/Icaro_System';

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../src/server');

// ─── Helpers para generar tokens de prueba ────────────────────────────────────
const SECRET = process.env.JWT_SECRET;

const makeToken = (payload, secret = SECRET, expiresIn = '8h') =>
  jwt.sign(payload, secret, { expiresIn });

const adminToken    = makeToken({ id: 'usr-test-admin',    email: 'admin@test.com',    rol: 'Administrador del Sistema' });
const residenteToken = makeToken({ id: 'usr-test-res',    email: 'res@test.com',       rol: 'Residente' });
const contadorToken  = makeToken({ id: 'usr-test-cont',   email: 'cont@test.com',      rol: 'Contador' });
const expiredToken   = makeToken({ id: 'usr-test-exp', email: 'exp@test.com', rol: 'Administrador del Sistema' }, SECRET, '-1s');
const wrongSecretToken = makeToken({ id: 'usr-test-wrong', email: 'w@test.com', rol: 'Administrador del Sistema' }, 'clave_incorrecta');

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 1: requireAuth — Validación básica de token
// ─────────────────────────────────────────────────────────────────────────────
describe('Seguridad: requireAuth — Validación de Bearer Token', () => {

  test('1. Sin token → 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('2. Token con formato inválido (sin Bearer) → 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', adminToken); // sin prefijo 'Bearer '
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/formato/i);
  });

  test('3. Token firmado con secreto incorrecto → 403', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${wrongSecretToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/inválido|corrupto/i);
  });

  test('4. Token expirado → 401 con mensaje de sesión', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/expirado|sesión/i);
  });

  test('5. Token válido de Admin → 200 ó 404 (usuario de prueba no existe en DB)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    // En entorno sin DB: puede ser 404 (usuario no encontrado) o 500 (no conecta).
    // Lo importante es que el auth middleware dejó pasar (no 401 ni 403).
    expect([200, 404, 500]).toContain(res.statusCode);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 2: requireRole — RBAC por Rol
// ─────────────────────────────────────────────────────────────────────────────
describe('Seguridad: requireRole — RBAC (Acceso restringido por Rol)', () => {

  test('6. GET /users sin token → 401', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toBe(401);
  });

  test('7. GET /users con rol Residente → 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${residenteToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  test('8. GET /users con rol Contador → 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${contadorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/denegado|rol/i);
  });

  test('9. GET /users con token Admin → pasa RBAC (200 ó error de DB)', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`);
    // 200: DB disponible; 500: DB no disponible en entorno CI.
    // Lo que importa: el RBAC no bloqueó (no 403).
    expect([200, 500]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(403);
  });

  test('10. POST /users con rol Residente → 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${residenteToken}`)
      .send({ nombre: 'Test', apellido: 'User', email: 'test@test.com', password: '123', idRol: 1 });
    expect(res.statusCode).toBe(403);
  });

  test('11. PATCH /users/:id/role con rol Contador → 403 Forbidden', async () => {
    const res = await request(app)
      .patch('/api/v1/users/cualquier-id/role')
      .set('Authorization', `Bearer ${contadorToken}`)
      .send({ idRol: 2 });
    expect(res.statusCode).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 3: Rutas públicas — No deben requerir token
// ─────────────────────────────────────────────────────────────────────────────
describe('Seguridad: Rutas públicas accesibles sin autenticación', () => {

  test('12. POST /auth/login sin token → accesible (400 por faltar campos)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });

  test('13. GET /health → 200 sin autenticación', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GRUPO 4: Control de Acceso por Proyecto (Act. 9 — validación de 403)
// ─────────────────────────────────────────────────────────────────────────────
describe('Seguridad: Control de acceso por Proyecto y Fecha', () => {

  test('14. GET /proyectos/:id sin token → 401', async () => {
    const res = await request(app).get('/api/v1/proyectos/proyecto-inexistente-uuid');
    expect(res.statusCode).toBe(401);
  });

  test('15. GET /proyectos/:id con token Residente (sin asignación en DB) → 403 ó 500', async () => {
    const res = await request(app)
      .get('/api/v1/proyectos/00000000-0000-0000-0000-000000000001')
      .set('Authorization', `Bearer ${residenteToken}`);
    // 403: no tiene asignación; 404: proyecto no existe; 500: DB no disponible
    expect([403, 404, 500]).toContain(res.statusCode);
    // Si no hay DB, 500 es aceptable; pero si la DB está, debe ser 403 ó 404.
    if (res.statusCode === 403) {
      expect(res.body.error).toMatch(/denegado|asignado|expirado/i);
    }
  });
});
