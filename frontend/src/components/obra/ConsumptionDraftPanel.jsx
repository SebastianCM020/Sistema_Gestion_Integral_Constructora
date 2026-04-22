import React from 'react';
import { FileText, RotateCcw } from 'lucide-react';

export function ConsumptionDraftPanel({ selectedMaterial, values, onReset }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#2F3A45]">Borrador actual</p>
          <p className="mt-1 text-sm text-gray-500">Revise el contexto antes de registrar el consumo.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#D1D5DB] text-[#2F3A45] hover:bg-[#F7F9FC]"
          aria-label="Limpiar borrador"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="mt-4 space-y-3 text-sm text-gray-600">
        <p>
          Material actual: <span className="font-semibold text-[#2F3A45]">{selectedMaterial ? `${selectedMaterial.code} · ${selectedMaterial.name}` : 'Sin seleccionar'}</span>
        </p>
        <p>
          Cantidad digitada: <span className="font-semibold text-[#2F3A45]">{values.quantity || 'Sin registro'}</span>
        </p>
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            <FileText size={14} className="text-[#1F4E79]" />
            Observación rápida
          </div>
          <p className="mt-2 text-sm text-[#2F3A45]">{values.observations.trim() || 'No hay observaciones capturadas en este borrador.'}</p>
        </div>
      </div>
    </section>
  );
}