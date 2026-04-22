import React from 'react';
import { Eye, Pencil, Settings2, ToggleLeft } from 'lucide-react';
import { formatCurrency, formatShortDate } from '../../utils/projectHelpers.js';
import { ProjectStatusBadge } from './ProjectStatusBadge.jsx';

export function ProjectsTable({ projects, onView, onEdit, onOpenParameters, onChangeStatus }) {
  return (
    <div className="hidden overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#D1D5DB]">
          <thead className="bg-[#F7F9FC]">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              <th className="px-5 py-4">Proyecto</th>
              <th className="px-5 py-4">Entidad / contrato</th>
              <th className="px-5 py-4">Presupuesto</th>
              <th className="px-5 py-4">Inicio</th>
              <th className="px-5 py-4">Fin prevista</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D1D5DB] bg-white text-sm text-[#2F3A45]">
            {projects.map((project) => (
              <tr key={project.id} className="align-top hover:bg-[#F7F9FC]">
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#2F3A45]">{project.code} · {project.name}</p>
                  <p className="mt-1 text-gray-500">{project.managerName}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#2F3A45]">{project.contractorEntity}</p>
                  <p className="mt-1 text-gray-500">{project.contractNumber || 'Sin contrato registrado'}</p>
                </td>
                <td className="px-5 py-4">{formatCurrency(project.totalBudget)}</td>
                <td className="px-5 py-4">{formatShortDate(project.startDate)}</td>
                <td className="px-5 py-4">{formatShortDate(project.plannedEndDate)}</td>
                <td className="px-5 py-4"><ProjectStatusBadge status={project.status} /></td>
                <td className="px-5 py-4">
                  <div className="grid gap-2 xl:grid-cols-[repeat(2,minmax(0,1fr))]">
                    <ActionButton icon={Eye} label="Ver detalle" onClick={() => onView(project)} />
                    <ActionButton icon={Pencil} label="Editar" onClick={() => onEdit(project)} />
                    <ActionButton icon={Settings2} label="Parametrizar" onClick={() => onOpenParameters(project)} />
                    <ActionButton icon={ToggleLeft} label="Cambiar estado" onClick={() => onChangeStatus(project)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-xs font-semibold text-[#2F3A45] hover:bg-white"
    >
      <Icon size={14} />
      {label}
    </button>
  );
}