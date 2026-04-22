const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { logFromRequest } = require('../services/audit.service');

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

// ─── Helper: adecuar el objeto de DB al formato esperado por el frontend ──────
const formatUser = (user) => ({
  id:          user.id,
  firstName:   user.nombre,
  lastName:    user.apellido,
  email:       user.email,
  role:        user.rol?.nombre || null,
  idRol:       user.idRol,
  isActive:    user.activo,
  createdAt:   user.createdAt,
  updatedAt:   user.updatedAt,
  // Campos opcionales no almacenados en DB (se devuelven vacíos para compatibilidad)
  phone:       null,
  projectScope:null,
  notes:       null,
  permissions: [],
  lastLogin:   null,
});

// ─── GET /api/v1/users ────────────────────────────────────────────────────────
/**
 * Lista todos los usuarios con paginación y filtros opcionales.
 * Solo accesible para Administrador del Sistema.
 *
 * Query params:
 *   - search  : busca en nombre, apellido o email
 *   - rol     : filtra por nombre de rol
 *   - activo  : 'true' | 'false'
 *   - page    : página (default: 1)
 *   - limit   : registros por página (default: 20, max: 100)
 */
const listUsers = async (req, res) => {
  try {
    const { search, rol, activo, page = '1', limit = '20' } = req.query;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    // Construir filtros dinámicos de Prisma
    const where = {};

    if (search) {
      where.OR = [
        { nombre:   { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { email:    { contains: search, mode: 'insensitive' } },
      ];
    }

    if (rol) {
      where.rol = { nombre: { contains: rol, mode: 'insensitive' } };
    }

    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { rol: { select: { id: true, nombre: true } } },
      }),
      prisma.usuario.count({ where }),
    ]);

    return res.status(200).json({
      data:  users.map(formatUser),
      meta: {
        total,
        page:      pageNum,
        limit:     limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[UsersController] listUsers:', error);
    return res.status(500).json({ error: 'Error al obtener la lista de usuarios.' });
  }
};

// ─── POST /api/v1/users ───────────────────────────────────────────────────────
/**
 * Crea un nuevo usuario con hash de contraseña.
 * Solo accesible para Administrador del Sistema.
 *
 * Body requerido: { nombre, apellido, email, password, idRol }
 */
const createUser = async (req, res) => {
  try {
    const { nombre, apellido, email, password, idRol } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !email || !password || !idRol) {
      return res.status(400).json({
        error: 'Campos requeridos: nombre, apellido, email, password, idRol.'
      });
    }

    // Verificar email único
    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo electrónico.' });
    }

    // Verificar que el rol existe
    const rol = await prisma.rol.findUnique({ where: { id: parseInt(idRol, 10) } });
    if (!rol) {
      return res.status(404).json({ error: `El rol con id ${idRol} no existe.` });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.usuario.create({
      data: { nombre, apellido, email, passwordHash, idRol: parseInt(idRol, 10), activo: true },
      include: { rol: { select: { id: true, nombre: true } } },
    });

    // Auditoría
    await logFromRequest(req, {
      tabla:      'usuarios',
      operacion:  'INSERT',
      idRegistro: user.id,
      datosDespues: { nombre, apellido, email, idRol, activo: true },
    });

    return res.status(201).json({
      message: 'Usuario creado correctamente.',
      user:    formatUser(user),
    });
  } catch (error) {
    console.error('[UsersController] createUser:', error);
    return res.status(500).json({ error: 'Error al crear el usuario.' });
  }
};

// ─── PUT /api/v1/users/:id ────────────────────────────────────────────────────
/**
 * Actualiza datos generales de un usuario (nombre, apellido, email, idRol, activo).
 * Solo accesible para Administrador del Sistema.
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, idRol, activo } = req.body;

    const existing = await prisma.usuario.findUnique({
      where: { id },
      include: { rol: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Verificar email único si cambió
    if (email && email !== existing.email) {
      const conflict = await prisma.usuario.findUnique({ where: { email } });
      if (conflict) {
        return res.status(409).json({ error: 'El correo ya está en uso por otro usuario.' });
      }
    }

    const datosAntes = { nombre: existing.nombre, apellido: existing.apellido, email: existing.email, idRol: existing.idRol };

    const user = await prisma.usuario.update({
      where: { id },
      data: {
        ...(nombre    && { nombre }),
        ...(apellido  && { apellido }),
        ...(email     && { email }),
        ...(idRol     && { idRol: parseInt(idRol, 10) }),
        ...(activo !== undefined && { activo }),
      },
      include: { rol: { select: { id: true, nombre: true } } },
    });

    // Auditoría
    await logFromRequest(req, {
      tabla:       'usuarios',
      operacion:   'UPDATE',
      idRegistro:  id,
      datosAntes,
      datosDespues: { nombre, apellido, email, idRol, activo },
    });

    return res.status(200).json({
      message: 'Usuario actualizado correctamente.',
      user:    formatUser(user),
    });
  } catch (error) {
    console.error('[UsersController] updateUser:', error);
    return res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
};

// ─── PATCH /api/v1/users/:id/role ─────────────────────────────────────────────
/**
 * Cambia el rol de un usuario específico.
 * Solo accesible para Administrador del Sistema.
 *
 * Body: { idRol: number }
 */
const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { idRol } = req.body;

    if (!idRol) {
      return res.status(400).json({ error: 'Se requiere el campo idRol.' });
    }

    const existing = await prisma.usuario.findUnique({
      where: { id },
      include: { rol: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const newRol = await prisma.rol.findUnique({ where: { id: parseInt(idRol, 10) } });
    if (!newRol) {
      return res.status(404).json({ error: `El rol con id ${idRol} no existe.` });
    }

    const user = await prisma.usuario.update({
      where: { id },
      data:  { idRol: parseInt(idRol, 10) },
      include: { rol: { select: { id: true, nombre: true } } },
    });

    // Auditoría
    await logFromRequest(req, {
      tabla:       'usuarios',
      operacion:   'UPDATE',
      idRegistro:  id,
      datosAntes:  { rol: existing.rol?.nombre },
      datosDespues: { rol: newRol.nombre },
    });

    return res.status(200).json({
      message: `Rol actualizado a "${newRol.nombre}" correctamente.`,
      user:    formatUser(user),
    });
  } catch (error) {
    console.error('[UsersController] changeUserRole:', error);
    return res.status(500).json({ error: 'Error al cambiar el rol del usuario.' });
  }
};

// ─── PATCH /api/v1/users/:id/status ──────────────────────────────────────────
/**
 * Activa o desactiva la cuenta de un usuario.
 * Solo accesible para Administrador del Sistema.
 *
 * Body: { activo: boolean }
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo === undefined) {
      return res.status(400).json({ error: 'Se requiere el campo activo (true/false).' });
    }

    const existing = await prisma.usuario.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // No permitir auto-desactivación
    if (existing.id === req.user.id && !activo) {
      return res.status(403).json({ error: 'No puede desactivar su propia cuenta.' });
    }

    const user = await prisma.usuario.update({
      where: { id },
      data:  { activo: Boolean(activo) },
      include: { rol: { select: { id: true, nombre: true } } },
    });

    // Auditoría
    await logFromRequest(req, {
      tabla:       'usuarios',
      operacion:   'UPDATE',
      idRegistro:  id,
      datosAntes:  { activo: existing.activo },
      datosDespues: { activo: user.activo },
    });

    return res.status(200).json({
      message: `Cuenta ${activo ? 'activada' : 'desactivada'} correctamente.`,
      user:    formatUser(user),
    });
  } catch (error) {
    console.error('[UsersController] toggleUserStatus:', error);
    return res.status(500).json({ error: 'Error al cambiar el estado del usuario.' });
  }
};

// ─── GET /api/v1/users/roles ──────────────────────────────────────────────────
/**
 * Lista todos los roles disponibles en el sistema.
 * Útil para los dropdowns del frontend.
 */
const listRoles = async (req, res) => {
  try {
    const roles = await prisma.rol.findMany({
      orderBy: { id: 'asc' },
      select:  { id: true, nombre: true, descripcion: true },
    });
    return res.status(200).json({ data: roles });
  } catch (error) {
    console.error('[UsersController] listRoles:', error);
    return res.status(500).json({ error: 'Error al obtener los roles.' });
  }
};

module.exports = {
  listUsers,
  createUser,
  updateUser,
  changeUserRole,
  toggleUserStatus,
  listRoles,
};
