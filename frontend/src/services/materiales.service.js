// ─────────────────────────────────────────────────────────────────────────────
// materiales.service.js — Servicio de API para el catálogo de materiales
// Implementa la estrategia "Online-First, Offline-Fallback":
//   1. Si hay red → llama al API y actualiza caché local
//   2. Si no hay red → responde desde IndexedDB (Dexie)
// ─────────────────────────────────────────────────────────────────────────────

import api from '../utils/axios';
import {
  sincronizarMaterialesDesdeServidor,
  listarMaterialesOffline,
  listarCategoriasOffline,
  contarMaterialesLocales,
} from '../db/materialesLocalService';

/**
 * Normaliza un material del backend al formato que espera la UI de React.
 */
const normalize = (m) => ({
  ...m,
  code: m.codigo,
  name: m.nombre,
  category: m.categoria,
  unit: m.unidad,
  observations: m.descripcion || '',
  isActive: m.activo,
});

/**
 * Obtiene la lista de materiales.
 * Cuando hay conexión: descarga del servidor y actualiza caché.
 * Cuando no hay conexión: retorna lo que hay en IndexedDB.
 *
 * @param {object} params
 * @param {string}  [params.categoria]
 * @param {string}  [params.busqueda]
 * @param {boolean} [params.isOnline=true]
 */
export const fetchMateriales = async ({ categoria, busqueda, soloActivos, isOnline = true } = {}) => {
  if (isOnline) {
    try {
      const params = {};
      if (categoria) params.categoria = categoria;
      if (busqueda)  params.busqueda  = busqueda;
      if (soloActivos !== undefined) params.soloActivos = soloActivos;

      const { data } = await api.get('/materiales', { params });
      const normalizedData = data.data.map(normalize);
      // Actualizar caché local con los datos frescos del servidor
      await sincronizarMaterialesDesdeServidor(data.data);
      return { data: normalizedData, total: data.total, fromCache: false };
    } catch (error) {
      console.warn('[materiales] Falló el API, usando caché local:', error.message);
      // Si el API falla, caer al caché como fallback
    }
  }

  // --- Modo offline o fallback ---
  const localCount = await contarMaterialesLocales();
  if (localCount === 0) {
    return { data: [], total: 0, fromCache: true, cacheVacia: true };
  }

  const data = await listarMaterialesOffline({ categoria, busqueda });
  return { data: data.map(normalize), total: data.length, fromCache: true, cacheVacia: false };
};

/**
 * Obtiene las categorías disponibles (online primero, luego caché).
 * @param {boolean} isOnline
 */
export const fetchCategorias = async (isOnline = true) => {
  if (isOnline) {
    try {
      const { data } = await api.get('/materiales/categorias');
      return data.data;
    } catch {
      // fallback silencioso
    }
  }
  return listarCategoriasOffline();
};

/**
 * Crea un material en el servidor (solo online, requiere rol Admin).
 * @param {object} datos
 */
export const crearMaterial = async (datos) => {
  const { data } = await api.post('/materiales', datos);
  return { data: normalize(data.data) };
};

/**
 * Actualiza un material en el servidor (solo online, requiere rol Admin).
 * @param {string} id
 * @param {object} datos
 */
export const actualizarMaterial = async (id, datos) => {
  const { data } = await api.put(`/materiales/${id}`, datos);
  return { data: normalize(data.data) };
};

/**
 * Elimina (soft-delete) un material (solo online, requiere rol Admin).
 * @param {string} id
 */
export const eliminarMaterial = async (id) => {
  const { data } = await api.delete(`/materiales/${id}`);
  return { data: normalize(data.data) };
};
