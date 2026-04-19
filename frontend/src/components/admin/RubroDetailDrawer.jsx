import React from 'react';
import { Eye, Pencil } from 'lucide-react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { formatDateTime } from '../../utils/projectHelpers.js';
import { formatRubroMetrics } from '../../utils/rubroHelpers.js';
import { RubroStatusBadge } from './RubroStatusBadge.jsx';

export function RubroDetailDrawer({ rubro, onClose, onEdit }) {
  const metrics = formatRubroMetrics(rubro);

  return (
    <DrawerPanel
      title="Detalle del rubro"
      description="Consulte datos económicos y operativos sin perder el contexto del listado."
      onClose={onClose}
    >
      <div className="space-y-6">
        <section className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-5">
          <p className="text-lg font-semibold text-[#2F3A45]">{rubro.code}</p>
          <p className="mt-1 text-sm text-gray-500">{rubro.description}</p>
          <div className="mt-4"><RubroStatusBadge isActive={rubro.isActive} /></div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <InfoCard label="Proyecto asociado" value={`${rubro.projectCode} · ${rubro.projectName}`} />
          <InfoCard label="Unidad" value={rubro.unit} />
          <InfoCard label="Precio unitario" value={metrics.unitPrice} />
          <InfoCard label="Cantidad presupuestada" value={metrics.budgetedQuantity} />
          <InfoCard label="Cantidad ejecutada" value={metrics.executedQuantity} />
          <InfoCard label="Última actualización" value={formatDateTime(rubro.updatedAt)} />
        </section>

        <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5">
          <p className="text-sm font-semibold text-[#2F3A45]">Acciones rápidas</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ActionButton icon={Pencil} label="Editar rubro" onClick={onEdit} />
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