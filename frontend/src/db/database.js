// ─────────────────────────────────────────────────────────────────────────────
// database.js — HT-04: Inicialización de la base de datos local con Dexie
//
// Dexie es la librería que ya está instalada en este proyecto (package.json).
// Envuelve IndexedDB (nativo del navegador) con una API similar a SQLite.
// Es el equivalente funcional de SQLite para apps web / PWA.
//
// Campos sync_status:
//   'synced'  → El registro está en sincronía con el servidor
//   'pending' → Creado/modificado offline, pendiente de enviar al servidor
//   'error'   → Intentó sincronizarse pero falló (detalle en sync_error)
// ─────────────────────────────────────────────────────────────────────────────

import Dexie from 'dexie';

// Nombre de la base de datos en IndexedDB del navegador
export const DB_NAME = 'icaro_local_v1';

/**
 * Instancia principal de la BD local ICARO.
 * Exportada como singleton para usar en toda la app.
 */
export const db = new Dexie(DB_NAME);

// ── Definición del esquema (versión 1 — Sprint 3) ───────────────────────────
// Los campos listados en los índices son los que se pueden usar en .where()
// El campo '++'  = autoincremento (no se usa aquí, usamos UUIDs)
// El campo '&'   = índice único
// El campo '*'   = índice multi-valor (arrays)
// Campos no listados también se almacenan, solo no son indexables por .where()

db.version(1).stores({
  /**
   * Tabla: materiales_local
   * Caché del catálogo de materiales descargado del servidor.
   * sync_status: siempre 'synced' (catálogo es de solo lectura para bodeguero)
   */
  materiales_local: [
    '&id',          // PK — UUID del servidor (índice único)
    'codigo',
    'categoria',    // Indexado para permitir filtros rápidos offline
    'nombre',
    'activo',
    'sync_status',
    'server_updated_at',
  ].join(', '),

  /**
   * Tabla: inventario_local
   * Stock disponible por [material, proyecto]. Clave compuesta.
   * sync_status: 'pending' cuando se modifica offline
   */
  inventario_local: [
    '[id_material+id_proyecto]', // PK compuesta
    'id_material',
    'id_proyecto',
    'sync_status',
  ].join(', '),

  /**
   * Tabla: movimientos_inventario_local
   * Registros creados por el bodeguero (pueden ser offline).
   * sync_status: nace como 'pending' si no hay conexión
   */
  movimientos_inventario_local: [
    '&id',          // PK — UUID generado localmente
    'id_material',
    'id_proyecto',
    'id_usuario',
    'tipo_movimiento',
    'sync_status',  // Indexado para que el SyncManager filtre fácilmente
    'local_created_at',
  ].join(', '),
});

// ── Hooks de ciclo de vida ───────────────────────────────────────────────────
db.on('ready', () => {
  console.log('[ICARO DB] IndexedDB inicializada correctamente →', DB_NAME);
});

db.on('blocked', () => {
  console.warn('[ICARO DB] Otra pestaña está bloqueando la actualización de la BD.');
});

export default db;
