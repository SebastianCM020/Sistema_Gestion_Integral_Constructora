import React from 'react';
import { Box, PackageCheck, PackageX } from 'lucide-react';
import { formatConsumptionQuantity, getMaterialAvailabilityTone } from '../../utils/consumptionHelpers.js';

const toneStyles = {
  success: 'border-[#16A34A]/20 bg-[#DCFCE7] text-[#166534]',
  warning: 'border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]',
  danger: 'border-[#DC2626]/20 bg-[#FEE2E2] text-[#991B1B]',
  neutral: 'border-[#D1D5DB] bg-[#F7F9FC] text-[#2F3A45]',
};

export function AvailableMaterialsList({ materials, selectedMaterialId, onSelect, query }) {
  if (!materials.length) {
    return (
      <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#2F3A45]">No hay resultados para la búsqueda actual</p>
        <p className="mt-1 text-sm text-gray-500">Ajuste el término de búsqueda para encontrar un material disponible dentro del proyecto activo.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">Materiales disponibles</h2>
          <p className="mt-1 text-sm text-gray-600">Seleccione el material que va a consumir. El stock visible corresponde al proyecto activo.</p>
        </div>
        <span className="text-sm font-medium text-gray-500">{materials.length} resultado{materials.length === 1 ? '' : 's'}</span>
      </div>

      {query ? <p className="mt-3 text-xs text-gray-500">Filtro actual: “{query}”</p> : null}

      <div className="mt-4 space-y-3">
        {materials.map((material) => {
          const tone = getMaterialAvailabilityTone(material);
          const isSelected = selectedMaterialId === material.id;

          return (
            <button
              key={material.id}
              type="button"
              onClick={() => onSelect(material.id)}
              className={`w-full rounded-[12px] border p-4 text-left transition ${isSelected ? 'border-[#1F4E79] bg-[#DCEAF7]/30 shadow-sm' : 'border-[#D1D5DB] bg-[#F7F9FC] hover:bg-white'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{material.code}</p>
                  <p className="mt-1 text-sm font-semibold text-[#2F3A45]">{material.name}</p>
                  <p className="mt-2 text-xs text-gray-500">Ubicación: {material.warehouseLocation}</p>
                </div>
                <Box size={18} className="text-[#1F4E79]" />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneStyles[tone]}`}>
                  {tone === 'danger' ? <PackageX size={14} /> : <PackageCheck size={14} />}
                  Stock: {formatConsumptionQuantity(material.availableQuantity)} {material.unit}
                </span>
                <span className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-white px-3 py-1 text-xs font-medium text-[#2F3A45]">Unidad: {material.unit}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}