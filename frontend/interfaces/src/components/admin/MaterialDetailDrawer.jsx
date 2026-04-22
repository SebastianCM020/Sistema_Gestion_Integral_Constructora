import React from 'react';
import { Eye, Pencil } from 'lucide-react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { formatMaterialDate } from '../../utils/materialHelpers.js';
import { MaterialStatusBadge } from './MaterialStatusBadge.jsx';
import { UnitBadge } from './UnitBadge.jsx';

export function MaterialDetailDrawer({ material, onClose, onEdit }) {
  return (
    <DrawerPanel
      title="Detalle del material"
      description="Revise la referencia sin perder el contexto del listado principal."
      onClose={onClose}
    >
      <div className="space-y-6">
        <section className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{material.code}</p>
          <p className="mt-2 text-lg font-semibold text-[#2F3A45]">{material.name}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MaterialStatusBadge isActive={material.isActive} />
            <UnitBadge unit={material.unit} />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <InfoCard label="Fecha de creación" value={formatMaterialDate(material.createdAt)} />
          <InfoCard label="Última actualización" value={formatMaterialDate(material.updatedAt)} />
          <InfoCard label="Estado actual" value={<MaterialStatusBadge isActive={material.isActive} />} />
          <InfoCard label="Unidad" value={<UnitBadge unit={material.unit} />} />
        </section>

        <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5">
          <p className="text-sm font-semibold text-[#2F3A45]">Observaciones</p>
          <p className="mt-2 text-sm text-gray-600">{material.observations || 'No hay observaciones registradas para este material.'}</p>
        </section>

        <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5">
          <p className="text-sm font-semibold text-[#2F3A45]">Acciones rápidas</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ActionButton icon={Pencil} label="Editar material" onClick={onEdit} />
            <ActionButton icon={Eye} label="Cerrar detalle" onClick={onClose} />
          </div>
        </section>
      </div>
    </DrawerPanel>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</p>
      <div className="mt-2 text-sm text-[#2F3A45]">{value}</div>
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