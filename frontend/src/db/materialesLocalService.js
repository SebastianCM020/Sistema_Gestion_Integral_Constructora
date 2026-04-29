// ─────────────────────────────────────────────────────────────────────────────
// materialesLocalService.js — HT-04: Operaciones offline sobre materiales
// Capa de abstracción entre los componentes y Dexie (IndexedDB).
// ─────────────────────────────────────────────────────────────────────────────

import { db } from '../db/database';

/**
 * Guarda (o actualiza) la lista de materiales descargada del servidor.
 * Se llama tras un GET exitoso al API cuando hay conexión.
 * @param {Array} materiales - Array de materiales del servidor
 */
export const sincronizarMaterialesDesdeServidor = async (materiales) => {
  const ahora = new Date().toISOString();
  const registros = materiales.map((m) => ({
    id:               m.id,
    codigo:           m.codigo,
    nombre:           m.nombre,
    categoria:        m.categoria,
    unidad:           m.unidad,
    descripcion:      m.descripcion ?? '',
    activo:           m.activo ? 1 : 0,
    sync_status:      'synced',
    server_updated_at: ahora,
  }));

  // bulkPut = insertar o actualizar (upsert masivo)
  await db.materiales_local.bulkPut(registros);
  console.log(`[DB Local] ${registros.length} materiales sincronizados.`);
};

/**
 * Lista los materiales desde la BD local con filtros opcionales.
 * Se usa cuando no hay conexión a internet.
 * @param {object} filtros
 * @param {string} [filtros.categoria]
 * @param {string} [filtros.busqueda]
 */
export const listarMaterialesOffline = async ({ categoria, busqueda } = {}) => {
  let collection = db.materiales_local.where('activo').equals(1);

  if (categoria && categoria.trim()) {
    collection = db.materiales_local
      .where('categoria').equalsIgnoreCase(categoria.trim())
      .and((m) => m.activo === 1);
  }

  let resultados = await collection.toArray();

  // Filtro de búsqueda por texto (IndexedDB no tiene LIKE nativo)
  if (busqueda && busqueda.trim()) {
    const termino = busqueda.trim().toLowerCase();
    resultados = resultados.filter(
      (m) =>
        m.nombre.toLowerCase().includes(termino) ||
        m.codigo.toLowerCase().includes(termino)
    );
  }

  return resultados.sort((a, b) =>
    a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre)
  );
};

/**
 * Retorna las categorías únicas disponibles en la BD local.
 */
export const listarCategoriasOffline = async () => {
  const materiales = await db.materiales_local.where('activo').equals(1).toArray();
  const categorias = [...new Set(materiales.map((m) => m.categoria))];
  return categorias.sort();
};

/**
 * Cuenta los materiales almacenados localmente.
 * Útil para saber si el caché está vacío.
 */
export const contarMaterialesLocales = async () => {
  return db.materiales_local.count();
};
