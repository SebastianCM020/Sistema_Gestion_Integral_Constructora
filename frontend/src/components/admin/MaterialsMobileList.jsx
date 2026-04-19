import React from 'react';
import { Eye, PauseCircle, Pencil, PlayCircle } from 'lucide-react';
import { formatMaterialDate } from '../../utils/materialHelpers.js';
import { MaterialStatusBadge } from './MaterialStatusBadge.jsx';
import { UnitBadge } from './UnitBadge.jsx';

export function MaterialsMobileList({ materials, onView, onEdit, onToggleStatus }) {
  return (
    <div className="space-y-4 lg:hidden">
      {materials.map((material) => (
        <article key={material.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{material.code}</p>
              <p className="mt-1 text-base font-semibold text-[#2F3A45]">{material.name}</p>
            </div>
            <MaterialStatusBadge isActive={material.isActive} />
          </div>

          <div className="mt-4 grid gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 sm:grid-cols-2">
            <InfoItem label="Unidad" value={<UnitBadge unit={material.unit} />} />
            <InfoItem label="Actualización" value={formatMaterialDate(material.updatedAt)} />
          </div>

          <p className="mt-4 text-sm text-gray-600">{material.observations || 'Sin observaciones registradas.'}</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <ActionButton icon={Eye} label="Detalle" onClick={() => onView(material)} />
            <ActionButton icon={Pencil} label="Editar" onClick={() => onEdit(material)} />
            <ActionButton icon={material.isActive ? PauseCircle : PlayCircle} label={material.isActive ? 'Desactivar' : 'Activar'} onClick={() => onToggleStatus(material)} />
          </div>
        </article>
      ))}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</p>
      <div className="mt-1 text-sm text-[#2F3A45]">{value}</div>
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