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

db.version(2).stores({
  materiales_local: [
    '&id',
    'codigo',
    'categoria',
    'nombre',
    'activo',
    'sync_status',
    'server_updated_at',
  ].join(', '),

  inventario_local: [
    '[id_material+id_proyecto]',
    'id_material',
    'id_proyecto',
    'sync_status',
  ].join(', '),

  movimientos_inventario_local: [
    '&id',
    'id_material',
    'id_proyecto',
    'id_usuario',
    'tipo_movimiento',
    'sync_status',
    'local_created_at',
  ].join(', '),

  /**
   * Tabla: avances_local (Sprint 5)
   * Registros de avance de obra con evidencia fotográfica local.
   */
  avances_local: [
    '&id',           // UUID local
    'idProyecto',
    'idRubro',
    'sync_status',   // 'pending' | 'synced' | 'error'
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
