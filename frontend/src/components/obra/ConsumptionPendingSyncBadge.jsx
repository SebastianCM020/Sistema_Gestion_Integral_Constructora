import React from 'react';
import { CloudCheck, CloudOff } from 'lucide-react';

/**
 * Muestra el estado de sincronización de los consumos locales.
 * Solo muestra "pendiente" cuando realmente hay consumos en cola.
 *
 * @param {number} count - Cantidad de consumos pendientes de sincronizar
 */
export function ConsumptionPendingSyncBadge({ count = 0 }) {
  if (count > 0) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-1 text-xs font-semibold text-[#9A6700]">
        <CloudOff size={14} />
        {count} pendiente{count !== 1 ? 's' : ''} de sincronización
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#16A34A]/15 bg-[#16A34A]/10 px-3 py-1 text-xs font-semibold text-[#166534]">
      <CloudCheck size={14} />
      Sincronización al día
    </span>
  );
}