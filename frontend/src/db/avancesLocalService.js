import db from './database';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio para gestionar los avances de obra en la base de datos local (Dexie)
 */
export const avancesLocalService = {
  /**
   * Guarda un avance localmente con su evidencia
   */
  async saveLocal(avanceData, evidenciaBlob) {
    const localId = uuidv4();
    const record = {
      id: localId,
      ...avanceData,
      evidencia: evidenciaBlob, // IndexedDB soporta Blobs
      sync_status: 'pending',
      local_created_at: new Date().toISOString(),
      sync_error: null,
    };

    await db.avances_local.add(record);
    return record;
  },

  /**
   * Obtiene todos los avances pendientes de sincronizar
   */
  async getPending() {
    return await db.avances_local.where('sync_status').equals('pending').toArray();
  },

  /**
   * Marca un avance como sincronizado
   */
  async markAsSynced(localId, serverResponse) {
    await db.avances_local.update(localId, {
      sync_status: 'synced',
      server_id: serverResponse.id,
      sync_timestamp: new Date().toISOString(),
    });
  },

  /**
   * Marca un avance con error de sincronización
   */
  async markAsError(localId, errorMsg) {
    await db.avances_local.update(localId, {
      sync_status: 'error',
      sync_error: errorMsg,
    });
  },

  /**
   * Obtiene el historial de avances locales (útil para la UI)
   */
  async getAllLocal() {
    return await db.avances_local.orderBy('local_created_at').reverse().toArray();
  }
};
