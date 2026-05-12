// ─────────────────────────────────────────────────────────────────────────────
// SyncStatusBanner.jsx — Banner global de estado de sincronización offline
// Se monta a nivel de App y es visible desde cualquier módulo.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getPendingSyncItems, syncPendingQueue } from '../../services/offlineSyncService';

// Estados internos del banner
const STATUS = {
  IDLE:      'idle',
  OFFLINE:   'offline',
  SYNCING:   'syncing',
  SUCCESS:   'success',
  PARTIAL:   'partial',
  ERROR:     'error',
};

export const SyncStatusBanner = () => {
  const { isOnline, justCameOnline } = useNetworkStatus();
  const [status, setStatus]               = useState(STATUS.IDLE);
  const [pendingCount, setPendingCount]   = useState(0);
  const [syncResult, setSyncResult]       = useState(null);
  const [visible, setVisible]             = useState(false);

  // Consultar cuántos registros hay pendientes al montar
  useEffect(() => {
    getPendingSyncItems().then(items => {
      if (items.length > 0 && !isOnline) {
        setPendingCount(items.length);
        setStatus(STATUS.OFFLINE);
        setVisible(true);
      }
    });
  }, []);

  // Mostrar banner offline cuando se pierde la conexión
  useEffect(() => {
    if (!isOnline) {
      getPendingSyncItems().then(items => setPendingCount(items.length));
      setStatus(STATUS.OFFLINE);
      setVisible(true);
    }
  }, [isOnline]);

  // Disparar sincronización cuando vuelve la red
  useEffect(() => {
    if (!justCameOnline) return;

    const runSync = async () => {
      // Verificar si hay algo que sincronizar
      const pending = await getPendingSyncItems();
      if (pending.length === 0) {
        // Volvió online sin nada pendiente — ocultar banner suavemente
        setVisible(false);
        return;
      }

      // Mostrar estado sincronizando
      setPendingCount(pending.length);
      setStatus(STATUS.SYNCING);
      setVisible(true);

      // Ejecutar sincronización
      const result = await syncPendingQueue();
      setSyncResult(result);

      if (result.synced > 0 && result.failed === 0) {
        setStatus(STATUS.SUCCESS);
      } else if (result.synced > 0 && result.failed > 0) {
        setStatus(STATUS.PARTIAL);
      } else {
        setStatus(STATUS.ERROR);
      }

      // Auto-ocultar el banner de éxito después de 5 segundos
      if (result.failed === 0) {
        setTimeout(() => setVisible(false), 5000);
      }
    };

    runSync();
  }, [justCameOnline]);

  if (!visible) return null;

  const configs = {
    [STATUS.OFFLINE]: {
      bg:   'bg-amber-500',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      ),
      text: pendingCount > 0
        ? `Sin conexión — ${pendingCount} avance(s) guardados localmente. Se sincronizarán al recuperar la red.`
        : 'Sin conexión — Los registros se guardarán localmente y se sincronizarán al volver a estar en línea.',
    },
    [STATUS.SYNCING]: {
      bg:   'bg-blue-600',
      icon: (
        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ),
      text: `Sincronizando ${pendingCount} registro(s) pendiente(s) con el servidor...`,
    },
    [STATUS.SUCCESS]: {
      bg:   'bg-green-600',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      text: `✓ Sincronización exitosa — ${syncResult?.synced || 0} avance(s) enviados al servidor correctamente.`,
    },
    [STATUS.PARTIAL]: {
      bg:   'bg-amber-600',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      text: `Sincronización parcial — ${syncResult?.synced || 0} enviados, ${syncResult?.failed || 0} con error (se reintentarán).`,
    },
    [STATUS.ERROR]: {
      bg:   'bg-red-600',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      text: `Error de sincronización — ${syncResult?.errors?.[0] || 'Intente nuevamente más tarde.'}`,
    },
  };

  const config = configs[status];
  if (!config) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-0 left-0 right-0 z-[9999] ${config.bg} text-white transition-all duration-300`}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          {config.icon}
          <span>{config.text}</span>
        </div>

        {/* Botón de cerrar solo disponible en estados terminales */}
        {(status === STATUS.SUCCESS || status === STATUS.PARTIAL || status === STATUS.ERROR || status === STATUS.OFFLINE) && (
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Cerrar notificación"
            className="shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
