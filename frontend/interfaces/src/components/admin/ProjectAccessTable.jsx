import React from 'react';
import { CalendarRange, Eye, Pencil, RefreshCcw, ShieldCheck } from 'lucide-react';
import { AccessModeBadge } from './AccessModeBadge.jsx';
import { ProjectAccessStatusBadge } from './ProjectAccessStatusBadge.jsx';
import { formatShortDate } from '../../utils/projectAccessHelpers.js';

export function ProjectAccessTable({ assignments, onView, onEdit, onChangeMode, onAdjustDates }) {
  return (
    <div className="hidden overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#D1D5DB]">
          <thead className="bg-[#F7F9FC]">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              <th className="px-5 py-4">Usuario</th>
              <th className="px-5 py-4">Proyecto</th>
              <th className="px-5 py-4">Inicio</th>
              <th className="px-5 py-4">Fin</th>
              <th className="px-5 py-4">Modo</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D1D5DB] bg-white text-sm text-[#2F3A45]">
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="align-top hover:bg-[#F7F9FC]">
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#2F3A45]">{assignment.userName}</p>
                  <p className="mt-1 text-gray-500">{assignment.userEmail}</p>
                  <p className="mt-1 text-xs font-medium text-[#1F4E79]">{assignment.userRole}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#2F3A45]">{assignment.projectName}</p>
                  <p className="mt-1 text-gray-500">{assignment.projectCode}</p>
                </td>
                <td className="px-5 py-4">{formatShortDate(assignment.startDate)}</td>
                <td className="px-5 py-4">{formatShortDate(assignment.endDate)}</td>
                <td className="px-5 py-4"><AccessModeBadge accessMode={assignment.accessMode} /></td>
                <td className="px-5 py-4"><ProjectAccessStatusBadge assignment={assignment} /></td>
                <td className="px-5 py-4">
                  <div className="grid gap-2 xl:grid-cols-[repeat(2,minmax(0,1fr))]">
                    <ActionButton icon={Eye} label="Ver detalle" onClick={() => onView(assignment)} />
                    <ActionButton icon={Pencil} label="Editar" onClick={() => onEdit(assignment)} />
                    <ActionButton icon={ShieldCheck} label="Cambiar modo" onClick={() => onChangeMode(assignment)} />
                    <ActionButton icon={CalendarRange} label="Ajustar vigencia" onClick={() => onAdjustDates(assignment)} />
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