import React from 'react';
import { Eye, Pencil } from 'lucide-react';
import { formatRubroMetrics } from '../../utils/rubroHelpers.js';
import { RubroStatusBadge } from './RubroStatusBadge.jsx';

export function RubrosMobileList({ rubros, onView, onEdit }) {
  return (
    <div className="space-y-4 lg:hidden">
      {rubros.map((rubro) => {
        const metrics = formatRubroMetrics(rubro);

        return (
          <article key={rubro.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-[#2F3A45]">{rubro.code}</p>
                <p className="mt-1 text-sm text-gray-500">{rubro.description}</p>
              </div>
              <RubroStatusBadge isActive={rubro.isActive} />
            </div>

            <div className="mt-4 grid gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 sm:grid-cols-2">
              <InfoItem label="Unidad" value={rubro.unit} />
              <InfoItem label="Precio unitario" value={metrics.unitPrice} />
              <InfoItem label="Cantidad presupuestada" value={metrics.budgetedQuantity} />
              <InfoItem label="Cantidad ejecutada" value={metrics.executedQuantity} />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <ActionButton icon={Eye} label="Ver detalle" onClick={() => onView(rubro)} />
              <ActionButton icon={Pencil} label="Editar rubro" onClick={() => onEdit(rubro)} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-[#2F3A45]">{value}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]"
    >
      <Icon size={16} />
      {label}
    </button>
  );
}