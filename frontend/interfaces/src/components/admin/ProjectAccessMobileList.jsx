import React from 'react';
import { CalendarRange, Eye, Pencil, ShieldCheck } from 'lucide-react';
import { AccessModeBadge } from './AccessModeBadge.jsx';
import { ProjectAccessStatusBadge } from './ProjectAccessStatusBadge.jsx';
import { DateRangeSummary } from './DateRangeSummary.jsx';

export function ProjectAccessMobileList({ assignments, onView, onEdit, onChangeMode, onAdjustDates }) {
  return (
    <div className="space-y-4 lg:hidden">
      {assignments.map((assignment) => (
        <article key={assignment.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-[#2F3A45]">{assignment.userName}</p>
              <p className="mt-1 text-sm text-gray-500">{assignment.userEmail}</p>
              <p className="mt-2 text-sm font-medium text-[#1F4E79]">{assignment.projectCode} · {assignment.projectName}</p>
            </div>
            <ProjectAccessStatusBadge assignment={assignment} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <AccessModeBadge accessMode={assignment.accessMode} />
            <span className="inline-flex items-center rounded-full border border-[#D1D5DB] px-3 py-1 text-xs font-semibold text-gray-600">
              {assignment.userRole}
            </span>
          </div>

          <div className="mt-4">
            <DateRangeSummary assignment={assignment} compact />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <MobileAction icon={Eye} label="Ver detalle" onClick={() => onView(assignment)} />
            <MobileAction icon={Pencil} label="Editar asignación" onClick={() => onEdit(assignment)} />
            <MobileAction icon={ShieldCheck} label="Cambiar modo" onClick={() => onChangeMode(assignment)} />
            <MobileAction icon={CalendarRange} label="Ajustar vigencia" onClick={() => onAdjustDates(assignment)} />
          </div>
        </article>
      ))}
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