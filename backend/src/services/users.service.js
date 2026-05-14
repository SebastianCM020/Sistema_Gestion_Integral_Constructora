const prisma = require('../utils/prisma');

/**
 * Servicio para la gestión de usuarios y roles
 */
const UserService = {
  /**
   * Verifica si existe un usuario con el email proporcionado
   */
  async findByEmail(email) {
    return await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true }
    });
  },

  /**
   * Valida si se puede desactivar un usuario Administrador
   * @param {string} userId - ID del usuario a desactivar/eliminar
   * @returns {Promise<boolean>} - True si es seguro, False si es el último admin activo
   */
  async canModifyAdminStatus(userId) {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { rol: true }
    });

    // Si no es admin, no hay restricción de este tipo
    if (!user || user.rol.nombre !== 'Administrador del Sistema') {
      return true;
    }

    // Contar cuántos administradores activos quedan
    const adminRole = await prisma.rol.findUnique({
      where: { nombre: 'Administrador del Sistema' }
    });

    const activeAdminsCount = await prisma.usuario.count({
      where: {
        idRol: adminRole.id,
        activo: true
      }
    });

    // Si es el último admin activo y se intenta desactivar, retornar false
    return activeAdminsCount > 1;
  },

  /**
   * Crea un usuario validando duplicados
   */
  async validateUniqueEmail(email, excludeId = null) {
    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing && existing.id !== excludeId) {
      throw new Error('Ya existe un usuario con ese correo electrónico.');
    }
  }
};

module.exports = UserService;
