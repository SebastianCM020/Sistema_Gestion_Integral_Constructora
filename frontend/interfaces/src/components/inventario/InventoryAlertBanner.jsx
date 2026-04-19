import React from 'react';
import { AlertTriangle, CircleCheckBig } from 'lucide-react';

export function InventoryAlertBanner({ activeAlertsCount }) {
  const hasAlerts = activeAlertsCount > 0;

  return (
    <section className={`rounded-[12px] border p-4 shadow-sm ${hasAlerts ? 'border-[#F59E0B]/25 bg-[#FFF7ED]' : 'border-[#16A34A]/20 bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${hasAlerts ? 'bg-[#F59E0B]/15 text-[#92400E]' : 'bg-[#16A34A]/10 text-[#16A34A]'}`}>
          {hasAlerts ? <AlertTriangle size={18} /> : <CircleCheckBig size={18} />}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#2F3A45]">{hasAlerts ? 'Hay alertas activas en los movimientos recientes' : 'No hay alertas activas en este momento'}</h2>
          <p className="mt-1 text-sm text-gray-600">{hasAlerts ? 'Revise excedentes y movimientos con stock insuficiente para tomar acción sin perder trazabilidad.' : 'El proyecto actual no presenta excedentes ni faltantes críticos en el periodo visible.'}</p>
        </div>
      </div>
    </section>
  );
}