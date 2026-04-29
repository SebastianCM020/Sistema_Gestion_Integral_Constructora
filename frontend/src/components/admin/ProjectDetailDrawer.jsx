import React from 'react';
import { CalendarRange, Eye, Pencil, Settings2, ToggleLeft } from 'lucide-react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { formatCurrency, formatDateTime, formatShortDate, getParameterSummaryItems } from '../../utils/projectHelpers.js';
import { ProjectStatusBadge } from './ProjectStatusBadge.jsx';

export function ProjectDetailDrawer({ project, onClose, onEdit, onOpenParameters, onChangeStatus }) {
  const parameterSummary = getParameterSummaryItems(project);

  return (
    <DrawerPanel
      title="Detalle del proyecto"
      description="Consulte datos generales, estado y parametrización sin perder el contexto del listado."
      onClose={onClose}
    >
      <div className="space-y-6">
        <section className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-5">
          <p className="text-lg font-semibold text-[#2F3A45]">{project.code} · {project.name}</p>
          <p className="mt-1 text-sm text-gray-500">{project.description}</p>
          <div className="mt-4"><ProjectStatusBadge status={project.status} /></div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <InfoCard label="Entidad contratante" value={project.contractorEntity} />
          <InfoCard label="Número de contrato" value={project.contractNumber || 'Sin contrato registrado'} />
          <InfoCard label="Presupuesto total" value={formatCurrency(project.totalBudget)} />
          <InfoCard label="Responsable" value={project.managerName || 'Sin asignar'} />
          <InfoCard label="Fecha de inicio" value={formatShortDate(project.startDate)} />
          <InfoCard label="Fecha fin prevista" value={formatShortDate(project.plannedEndDate)} />
          <InfoCard label="Última actualización" value={formatDateTime(project.updatedAt)} />
        </section>

        <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#DCEAF7] text-[#1F4E79]">
              <CalendarRange size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2F3A45]">Resumen de fechas</p>
              <p className="mt-1 text-sm text-gray-600">Inicio: {formatShortDate(project.fechaInicio)} · Fin prevista: {formatShortDate(project.fechaFinPrevista)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5">
          <p className="text-sm font-semibold text-[#2F3A45]">Parámetros operativos resumidos</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {parameterSummary.map((item) => (
              <span key={item.id} className="inline-flex rounded-full border border-[#D1D5DB] bg-[#F7F9FC] px-3 py-1 text-xs font-semibold text-[#2F3A45]">
                {item.label}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5">
          <p className="text-sm font-semibold text-[#2F3A45]">Acciones rápidas</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ActionButton icon={Pencil} label="Editar proyecto" onClick={onEdit} />
            <ActionButton icon={Settings2} label="Abrir parametrización" onClick={onOpenParameters} />
            <ActionButton icon={ToggleLeft} label="Cambiar estado" onClick={onChangeStatus} />
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
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC] transition-colors active:scale-95"
    >
      <Icon size={16} className="shrink-0" />
      <span>{label}</span>
    </button>
  );
}