/**
 * usersApi.js — Servicio de comunicación con la API REST de usuarios.
 *
 * Implementa un fallback completo a datos mock cuando el backend no
 * está disponible (Docker offline, red interrumpida, etc.).
 *
 * Criterio de aceptación Act. 8:
 *   - Administrador puede crear usuarios y asignar roles dinámicamente.
 */
import api from '../utils/axios';
import { mockUsers, availableRoles } from '../data/mockUsers';

// ─── Fallback store (simula estado persistente en memoria) ──────────────────
let mockStore = [...mockUsers];
let nextMockId = 9000;

const isMockMode = (error) => {
  // Activar modo mock si el servidor está caído (Network Error, ECONNREFUSED, etc.)
  return (
    !error.response || // sin respuesta del servidor
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNREFUSED'
  );
};

// ─── Helpers de transform ───────────────────────────────────────────────────
/**
 * Convierte el formato de la API (snake_case/campos DB) al formato del frontend.
 * La API ya devuelve el formato adaptado desde users.controller.js (formatUser).
 */
const toFrontend = (user) => user;

// ─── GET /api/v1/users ────────────────────────────────────────────────────────
/**
 * Obtiene la lista de usuarios con filtros opcionales.
 * @param {Object} filters - { search, rol, activo, page, limit }
 * @returns {Promise<{ data: User[], meta: Object, isMock: boolean }>}
 */
export const getUsers = async (filters = {}) => {
  try {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.rol)    params.rol    = filters.rol;
    if (filters.activo !== undefined) params.activo = filters.activo;
    if (filters.page)   params.page   = filters.page;
    if (filters.limit)  params.limit  = filters.limit;

    const { data } = await api.get('/users', { params });
    return { ...data, isMock: false };
  } catch (error) {
    if (isMockMode(error)) {
      console.warn('[usersApi] Backend no disponible — usando datos mock');

      let result = [...mockStore];

      // Aplicar filtros en mock
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (u) =>
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q)  ||
            u.email.toLowerCase().includes(q)
        );
      }
      if (filters.rol) {
        result = result.filter((u) => u.role === filters.rol);
      }
      if (filters.activo !== undefined) {
        result = result.filter((u) => u.isActive === (filters.activo === 'true' || filters.activo === true));
      }

      return {
        data: result,
        meta: { total: result.length, page: 1, limit: result.length, totalPages: 1 },
        isMock: true,
      };
    }
    throw error;
  }
};

// ─── GET /api/v1/users/roles ──────────────────────────────────────────────────
/**
 * Obtiene todos los roles disponibles.
 * @returns {Promise<{ data: Role[], isMock: boolean }>}
 */
export const getRoles = async () => {
  try {
    const { data } = await api.get('/users/roles');
    return { ...data, isMock: false };
  } catch (error) {
    if (isMockMode(error)) {
      const mockRoles = availableRoles.map((nombre, idx) => ({
        id: idx + 1,
        nombre,
        descripcion: null,
      }));
      return { data: mockRoles, isMock: true };
    }
    throw error;
  }
};

// ─── POST /api/v1/users ───────────────────────────────────────────────────────
/**
 * Crea un nuevo usuario.
 * @param {Object} userData - { nombre, apellido, email, password, idRol }
 * @returns {Promise<{ user: User, isMock: boolean }>}
 */
export const createUser = async (userData) => {
  try {
    const { data } = await api.post('/users', userData);
    return { ...data, isMock: false };
  } catch (error) {
    if (isMockMode(error)) {
      const newUser = {
        id:          `usr-mock-${++nextMockId}`,
        firstName:   userData.nombre     || userData.firstName,
        lastName:    userData.apellido   || userData.lastName,
        email:       userData.email,
        role:        userData.role       || availableRoles[0],
        isActive:    true,
        createdAt:   new Date().toISOString(),
        updatedAt:   new Date().toISOString(),
        lastLogin:   null,
        phone:       null,
        projectScope:null,
        notes:       null,
        permissions: [],
      };
      mockStore = [newUser, ...mockStore];
      return { message: 'Usuario creado (mock)', user: newUser, isMock: true };
    }
    throw error;
  }
};

// ─── PUT /api/v1/users/:id ────────────────────────────────────────────────────
/**
 * Actualiza datos generales de un usuario.
 * @param {string} id
 * @param {Object} userData
 * @returns {Promise<{ user: User, isMock: boolean }>}
 */
export const updateUser = async (id, userData) => {
  try {
    const { data } = await api.put(`/users/${id}`, userData);
    return { ...data, isMock: false };
  } catch (error) {
    if (isMockMode(error)) {
      mockStore = mockStore.map((u) =>
        u.id === id
          ? {
              ...u,
              firstName: userData.nombre || userData.firstName || u.firstName,
              lastName:  userData.apellido || userData.lastName || u.lastName,
              email:     userData.email   || u.email,
              role:      userData.role    || u.role,
              updatedAt: new Date().toISOString(),
            }
          : u
      );
      return { message: 'Usuario actualizado (mock)', user: mockStore.find((u) => u.id === id), isMock: true };
    }
    throw error;
  }
};

// ─── PATCH /api/v1/users/:id/role ─────────────────────────────────────────────
/**
 * Cambia el rol de un usuario.
 * @param {string} id
 * @param {string} role    - nombre del rol (frontend)
 * @param {number} [idRol] - id del rol (backend)
 * @returns {Promise<{ user: User, isMock: boolean }>}
 */
export const changeUserRole = async (id, role, idRol) => {
  try {
    const payload = idRol ? { idRol } : { role };
    const { data } = await api.patch(`/users/${id}/role`, payload);
    return { ...data, isMock: false };
  } catch (error) {
    if (isMockMode(error)) {
      mockStore = mockStore.map((u) =>
        u.id === id ? { ...u, role, updatedAt: new Date().toISOString() } : u
      );
      return { message: 'Rol actualizado (mock)', user: mockStore.find((u) => u.id === id), isMock: true };
    }
    throw error;
  }
};

// ─── PATCH /api/v1/users/:id/status ──────────────────────────────────────────
/**
 * Activa o desactiva la cuenta de un usuario.
 * @param {string} id
 * @param {boolean} isActive
 * @returns {Promise<{ user: User, isMock: boolean }>}
 */
export const toggleUserStatus = async (id, isActive) => {
  try {
    const { data } = await api.patch(`/users/${id}/status`, { activo: isActive });
    return { ...data, isMock: false };
  } catch (error) {
    if (isMockMode(error)) {
      mockStore = mockStore.map((u) =>
        u.id === id ? { ...u, isActive, updatedAt: new Date().toISOString() } : u
      );
      return { message: 'Estado actualizado (mock)', user: mockStore.find((u) => u.id === id), isMock: true };
    }
    throw error;
  }
};
