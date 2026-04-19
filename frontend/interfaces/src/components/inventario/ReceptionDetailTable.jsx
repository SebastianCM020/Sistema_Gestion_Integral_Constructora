import React from 'react';

export function ReceptionDetailTable({ lines, errors, onChange }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm">
      <div className="hidden grid-cols-[1.1fr_1.8fr_110px_140px] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:grid">
        <span>Código</span>
        <span>Material</span>
        <span>Aprobado</span>
        <span>Recibido</span>
      </div>

      <div className="divide-y divide-[#D1D5DB]">
        {lines.map((line) => (
          <div key={line.materialId} className="grid gap-3 px-4 py-4 md:grid-cols-[1.1fr_1.8fr_110px_140px] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Código</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{line.materialCode}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Material</p>
              <p className="text-sm text-[#2F3A45]">{line.materialName}</p>
              <p className="mt-1 text-xs text-gray-500">Unidad: {line.unidad}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Aprobado</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{line.cantidadAprobada} {line.unidad}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden" htmlFor={`received-${line.materialId}`}>Recibido</label>
              <input id={`received-${line.materialId}`} type="number" min="0" step="0.01" value={line.cantidadRecibida} onChange={(event) => onChange(line.materialId, event.target.value)} className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none" />
              {errors?.[line.materialId] ? <p className="mt-2 text-sm text-[#DC2626]">{errors[line.materialId]}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}