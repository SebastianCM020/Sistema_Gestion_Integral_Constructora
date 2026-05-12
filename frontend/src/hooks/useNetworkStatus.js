// ─────────────────────────────────────────────────────────────────────────────
// useNetworkStatus.js — HT-04: Hook para detectar estado de conexión
// Expone { isOnline, justCameOnline } para disparar sincronización al
// recuperar la red.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';

/**
 * Hook que retorna el estado de conexión actual.
 * @returns {{ isOnline: boolean, justCameOnline: boolean }}
 *   justCameOnline es true solo durante el ciclo de render inmediato a
 *   la transición offline→online, lo que permite disparar la sincronización
 *   exactamente una vez.
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline]           = useState(navigator.onLine);
  const [justCameOnline, setJustCameOnline] = useState(false);
  const wasOffline = useRef(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      if (wasOffline.current) {
        // Transitó de offline → online: señalizar para disparar sync
        setJustCameOnline(true);
        // Resetear la señal tras el siguiente ciclo de render
        setTimeout(() => setJustCameOnline(false), 100);
      }
      wasOffline.current = false;
      setIsOnline(true);
    };

    const handleOffline = () => {
      wasOffline.current = true;
      setIsOnline(false);
      setJustCameOnline(false);
    };

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, justCameOnline };
};
