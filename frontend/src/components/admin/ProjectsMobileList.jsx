import React from 'react';
import { Eye, Pencil, Settings2, ToggleLeft } from 'lucide-react';
import { formatCurrency, formatShortDate } from '../../utils/projectHelpers.js';
import { ProjectStatusBadge } from './ProjectStatusBadge.jsx';

export function ProjectsMobileList({ projects, onView, onEdit, onOpenParameters, onChangeStatus }) {
  return (
    <div className="space-y-4 lg:hidden">
      {projects.map((project) => (
        <article key={project.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-[#2F3A45]">{project?.code} · {project?.name}</p>
              <p className="mt-1 text-sm text-gray-500">{project?.contractorEntity}</p>
              <p className="mt-1 text-sm text-[#1F4E79]">
                Responsable: {project?.managerName || 'Sin asignar'}
              </p>
            </div>
            <ProjectStatusBadge status={project?.estado} />
          </div>

          <div className="mt-4 grid gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 sm:grid-cols-2">
            <InfoItem label="Contrato" value={project?.numeroContrato || 'Sin contrato'} />
            <InfoItem label="Presupuesto" value={formatCurrency(project?.presupuestoTotal)} />
            <InfoItem label="Inicio" value={formatShortDate(project?.fechaInicio)} />
            <InfoItem label="Fin prevista" value={formatShortDate(project?.fechaFinPrevista)} />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <MobileAction icon={Eye} label="Ver detalle" onClick={() => onView(project)} />
            <MobileAction icon={Pencil} label="Editar proyecto" onClick={() => onEdit(project)} />
            <MobileAction icon={Settings2} label="Parametrizar" onClick={() => onOpenParameters(project)} />
            <MobileAction icon={ToggleLeft} label="Cambiar estado" onClick={() => onChangeStatus(project)} />
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
      <p className="mt-1 text-sm text-[#2F3A45]">{value}</p>
    </div>
  );
}

function MobileAction({ icon: Icon, label, onClick }) {
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