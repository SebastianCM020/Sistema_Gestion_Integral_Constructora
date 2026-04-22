import React from 'react';

export function RequestLinesTable({ lines }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm">
      <div className="hidden grid-cols-[1.1fr_2fr_120px] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:grid">
        <span>Código</span>
        <span>Material</span>
        <span>Cantidad</span>
      </div>

      <div className="divide-y divide-[#D1D5DB]">
        {lines.map((line) => (
          <div key={`${line.materialId}-${line.materialCode}`} className="grid gap-3 px-4 py-4 md:grid-cols-[1.1fr_2fr_120px] md:items-center">
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
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Cantidad</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{line.cantidadSolicitada} {line.unidad}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}