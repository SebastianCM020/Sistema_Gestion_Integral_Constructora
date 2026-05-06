importScripts('https://cdn.jsdelivr.net/npm/idb@7/build/umd.js');

const DB_NAME = 'icaro_offline_db';
const STORE_NAME = 'sync_queue';

// Función para vaciar la cola hacia el servidor
async function syncAvances() {
  const db = await idb.openDB(DB_NAME, 1);
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.store;
  const requests = await store.getAll();
  
  if (requests.length === 0) return;

  console.log(`Iniciando sincronización de ${requests.length} registros...`);

  for (const request of requests) {
    try {
      // Intentar sincronizar
      // Nota: Asume que si requiere token, se maneje de otra forma o la API offline sync se relaje o reenvíe.
      // Por simplicidad, se reintenta sin re-leer localStorage porque service workers no tienen acceso a localStorage.
      // En un entorno de producción, se usaría IndexedDB para guardar el token.
      
      const response = await fetch(request.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.payload)
      });

      if (response.ok || response.status === 403 || response.status === 400) { 
        // Si tuvo éxito o dio error de negocio controlado (403, 400), eliminar de la cola local
        const deleteTx = db.transaction(STORE_NAME, 'readwrite');
        await deleteTx.store.delete(request.id);
        await deleteTx.done;
      }
    } catch (error) {
      console.error('Fallo al sincronizar registro individual. Se intentará luego.', error);
      break; 
    }
  }
}

// Escuchar el evento de Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-avances') {
    event.waitUntil(syncAvances());
  }
});
