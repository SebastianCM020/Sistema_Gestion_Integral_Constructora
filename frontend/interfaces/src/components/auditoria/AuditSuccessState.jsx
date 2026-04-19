import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export function AuditSuccessState({ visibleCount, totalCount, criticalCount, onOpenCriticalEvent }) {
  return (
    <section className="rounded-[12px] border border-[#16A34A]/20 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#16A34A]/10 text-[#16A34A]"><ShieldCheck size={20} /></div>
          <div>
            <h2 className="text-sm font-semibold text-[#2F3A45]">La trazabilidad se cargo correctamente</h2>
            <p className="mt-1 text-sm text-gray-600">Hay {visibleCount} eventos visibles sobre un total de {totalCount} registros consultables en el rango activo.</p>
          </div>
        </div>
        {criticalCount > 0 && onOpenCriticalEvent ? (
          <button type="button" onClick={onOpenCriticalEvent} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#DC2626]/20 px-4 text-sm font-medium text-[#991B1B] hover:bg-[#FEE2E2]/40">
            <AlertTriangle size={16} />
            Revisar evento critico ({criticalCount})
          </button>
        ) : null}
      </div>
    </section>
  );
}