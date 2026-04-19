import React from 'react';
import { Boxes, MapPin, TriangleAlert } from 'lucide-react';
import { formatConsumptionDate, formatConsumptionQuantity, getMaterialAvailabilityTone } from '../../utils/consumptionHelpers.js';

const toneMap = {
  success: 'border-[#16A34A]/15 bg-[#DCFCE7] text-[#166534]',
  warning: 'border-[#F59E0B]/15 bg-[#FFF7ED] text-[#92400E]',
  danger: 'border-[#DC2626]/15 bg-[#FEE2E2] text-[#991B1B]',
  neutral: 'border-[#D1D5DB] bg-[#F7F9FC] text-[#2F3A45]',
};

export function MaterialStockCard({ material }) {
  const tone = getMaterialAvailabilityTone(material);

  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Material seleccionado</p>
          <h2 className="mt-1 text-lg font-semibold text-[#2F3A45]">{material.code} · {material.name}</h2>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[tone]}`}>
          <TriangleAlert size={14} />
          {tone === 'danger' ? 'Sin stock' : tone === 'warning' ? 'Stock crítico' : 'Disponible'}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Stock disponible</p>
          <p className="mt-2 text-2xl font-semibold text-[#2F3A45]">{formatConsumptionQuantity(material.availableQuantity)} {material.unit}</p>
        </div>
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            <Boxes size={14} className="text-[#1F4E79]" /> Umbral mínimo
          </div>
          <p className="mt-2 text-sm font-semibold text-[#2F3A45]">{formatConsumptionQuantity(material.minimumThreshold)} {material.unit}</p>
        </div>
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
            <MapPin size={14} className="text-[#1F4E79]" /> Ubicación
          </div>
          <p className="mt-2 text-sm font-semibold text-[#2F3A45]">{material.warehouseLocation}</p>
          <p className="mt-1 text-xs text-gray-500">Actualizado {formatConsumptionDate(material.lastUpdatedAt)}</p>
        </div>
      </div>
    </section>
  );
}