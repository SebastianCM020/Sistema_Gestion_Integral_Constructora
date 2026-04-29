// ─────────────────────────────────────────────────────────────────────────────
// useNetworkStatus.js — HT-04: Hook para detectar estado de conexión
// Expone { isOnline } y dispara eventos cuando cambia la conectividad.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

/**
 * Hook que retorna el estado de conexión actual del navegador.
 * @returns {{ isOnline: boolean }}
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};
