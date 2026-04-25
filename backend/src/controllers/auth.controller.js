const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

const prisma = new PrismaClient();

// Memoria volátil para rastrear intentos (ideal para MVP, en prod llevar a Redis o DB)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 3;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutos de bloqueo

/**
 * Registra un intento fallido y bloquea si excede el límite
 */
const handleFailedAttempt = (email, res) => {
  const account = loginAttempts.get(email) || { attempts: 0, lockUntil: null };
  
  account.attempts += 1;
  
  if (account.attempts >= MAX_ATTEMPTS) {
    account.lockUntil = Date.now() + LOCK_TIME_MS;
    loginAttempts.set(email, account);
    return res.status(429).json({ error: 'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.' });
  }

  loginAttempts.set(email, account);
  const remaining = MAX_ATTEMPTS - account.attempts;
  return res.status(401).json({ error: `Credenciales inválidas. Te quedan ${remaining} intento(s).` });
};

/**
 * Autentica un usuario y emite un JWT
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Debes enviar email y correo' });
    }

    // Verificar si está bloqueado temporalmente
    const accountStatus = loginAttempts.get(email);
    if (accountStatus && accountStatus.lockUntil) {
      if (Date.now() < accountStatus.lockUntil) {
        return res.status(429).json({ error: 'Cuenta bloqueada temporalmente por múltiples intentos fallidos.' });
      } else {
        // Expiró el bloqueo, reiniciar
        loginAttempts.delete(email);
      }
    }

    // Buscar al usuario incluyendo su Rol
    const user = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true }
    });

    if (!user) {
      return handleFailedAttempt(email, res);
    }

    // Verificar que el usuario no esté deshabilitado por Recursos Humanos
    if (!user.activo) {
      return res.status(403).json({ error: 'Cuenta deshabilitada. Contacta al administrador.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return handleFailedAttempt(email, res);
    }

    // Si llega aquí es un éxito: limpiar historial de intentos fallidos
    loginAttempts.delete(email);

    // Construir la sesión/token
    const payload = {
      id: user.id,
      email: user.email,
      rol: user.rol.nombre,
      idRol: user.idRol
    };

    const token = generateToken(payload);

    const mustChangePassword = password === 'Icaro2025!';

    return res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol.nombre,
        mustChangePassword
      }
    });

  } catch (error) {
    console.error('Error en Login:', error);
    return res.status(500).json({ error: 'Error del servidor en el inicio de sesión' });
  }
};

/**
 * Obtener perfil del usuario autenticado
 * GET /api/v1/auth/me
 */
const getMe = async (req, res) => {
  try {
    // req.user viene inyectado por el middleware `requireAuth`
    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        activo: true,
        rol: { select: { nombre: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({ error: 'Error recertificando datos del perfil' });
  }
};

/**
 * Inicia el flujo de recuperación de contraseña
 * POST /api/v1/auth/recover-password
 */
const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'El correo es obligatorio' });
    }

    // Buscamos si existe
    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) {
      // Como medida anti-enumeración, siempre enviamos 200 aunque no exista,
      // O podemos devolver un 404 estricto para feedback rápido de UX interno.
      // Retornaremos 404 por ahora ya que es un ERP corporativo cerrado.
      return res.status(404).json({ error: 'Este correo no está registrado en el sistema.' });
    }

    if (!user.activo) {
       return res.status(403).json({ error: 'Cuenta deshabilitada. Contacte a RRHH.' });
    }

    // TODO: A futuro aquí se integraría Nodemailer o Sendgrid para mandar el LINK
    // Simulando retraso
    return res.status(200).json({ 
      message: 'Instrucciones enviadas con éxito',
      simulated: true
    });

  } catch (error) {
    console.error('Error en RecoverPassword:', error);
    return res.status(500).json({ error: 'Error procesando la solicitud de recuperación' });
  }
};

/**
 * Permite cambiar la contraseña obligatoria del usuario
 * PATCH /api/v1/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.usuario.update({
      where: { id: req.user.id },
      data: { passwordHash }
    });

    return res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error en changePassword:', error);
    return res.status(500).json({ error: 'Error actualizando la contraseña.' });
  }
};

module.exports = {
  login,
  getMe,
  recoverPassword,
  changePassword
};
