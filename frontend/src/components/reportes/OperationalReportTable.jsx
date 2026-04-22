import React from 'react';
import { ChevronRight } from 'lucide-react';
import { DashboardStatusBadge } from './DashboardStatusBadge.jsx';

export function OperationalReportTable({ rows, onOpenDetail }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm">
      <div className="hidden grid-cols-[120px_1.5fr_180px_120px_110px] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:grid">
        <span>Código</span>
        <span>Frente o rubro</span>
        <span>Responsable</span>
        <span>Valor</span>
        <span></span>
      </div>
      <div className="divide-y divide-[#D1D5DB]">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-4 px-4 py-4 md:grid-cols-[120px_1.5fr_180px_120px_110px] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Código</p>
              <p className="text-sm text-[#2F3A45]">{row.codigo}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Frente o rubro</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{row.descripcion}</p>
              <div className="mt-2"><DashboardStatusBadge status={row.estado} /></div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Responsable</p>
              <p className="text-sm text-[#2F3A45]">{row.responsable}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Valor</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{row.valor}</p>
            </div>
            <div className="flex justify-start md:justify-end">
              <button type="button" onClick={() => onOpenDetail(row)} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
                Ver detalle
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}