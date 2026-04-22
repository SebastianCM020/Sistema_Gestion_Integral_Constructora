import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export function RequestDetailTable({ lines, editable = false, onEdit, onDelete }) {
  if (!lines.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm">
      <div className="hidden grid-cols-[1.2fr_2fr_120px_120px] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:grid">
        <span>Código</span>
        <span>Material</span>
        <span>Cantidad</span>
        <span>Acciones</span>
      </div>

      <div className="divide-y divide-[#D1D5DB]">
        {lines.map((line) => (
          <div key={line.id ?? `${line.materialId}-${line.materialCode}`} className="grid gap-3 px-4 py-4 md:grid-cols-[1.2fr_2fr_120px_120px] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Código</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{line.materialCode}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Material</p>
              <p className="text-sm text-[#2F3A45]">{line.materialName}</p>
              <p className="mt-1 text-xs text-gray-500">Unidad: {line.unit}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Cantidad</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{line.requestedQuantity} {line.unit}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {editable ? (
                <>
                  <button type="button" onClick={() => onEdit(line)} className="inline-flex h-[36px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-xs font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
                    <Pencil size={14} /> Editar
                  </button>
                  <button type="button" onClick={() => onDelete(line)} className="inline-flex h-[36px] items-center justify-center gap-2 rounded-[10px] border border-[#DC2626]/20 px-3 text-xs font-medium text-[#DC2626] hover:bg-[#FEE2E2]/50">
                    <Trash2 size={14} /> Eliminar
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-500">Solo lectura</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}