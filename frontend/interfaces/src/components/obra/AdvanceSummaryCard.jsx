import React from 'react';
import { ClipboardCheck, FolderKanban, HardHat } from 'lucide-react';
import { formatProgressDate, formatQuantity } from '../../utils/progressHelpers.js';
import { getAdvanceReference } from '../../utils/evidenceHelpers.js';

export function AdvanceSummaryCard({ advanceContext, evidenceCount, syncLabel }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
          <ClipboardCheck size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">Contexto del avance actual</h2>
          <p className="mt-1 text-sm text-gray-600">Esta evidencia se asociará al avance seleccionado y al rubro activo del frente.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Proyecto</p>
          <p className="mt-2 text-sm font-semibold text-[#2F3A45]">{advanceContext.projectCode} · {advanceContext.projectName}</p>
          <p className="mt-1 text-xs text-gray-500">Avance {getAdvanceReference(advanceContext)}</p>
        </div>
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Rubro</p>
          <p className="mt-2 text-sm font-semibold text-[#2F3A45]">{advanceContext.rubroCode} · {advanceContext.rubroDescription}</p>
          <p className="mt-1 text-xs text-gray-500">Cantidad registrada: {formatQuantity(advanceContext.quantityAdvance)} {advanceContext.unit}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[12px] border border-[#D1D5DB] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            <HardHat size={14} /> Estado
          </div>
          <p className="mt-2 text-sm font-medium text-[#2F3A45]">Registrado y listo para asociar evidencia</p>
        </div>
        <div className="rounded-[12px] border border-[#D1D5DB] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            <FolderKanban size={14} /> Fecha
          </div>
          <p className="mt-2 text-sm font-medium text-[#2F3A45]">{formatProgressDate(advanceContext.registeredAt)}</p>
        </div>
        <div className="rounded-[12px] border border-[#D1D5DB] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Evidencias</p>
          <p className="mt-2 text-sm font-medium text-[#2F3A45]">{evidenceCount} registradas · {syncLabel}</p>
        </div>
      </div>
    </section>
  );
}