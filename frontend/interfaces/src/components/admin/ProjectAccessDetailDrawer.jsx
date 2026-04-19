import React from 'react';
import { CalendarRange, Eye, Pencil, ShieldCheck, UserRound } from 'lucide-react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { AccessModeBadge } from './AccessModeBadge.jsx';
import { DateRangeSummary } from './DateRangeSummary.jsx';
import { ProjectAccessStatusBadge } from './ProjectAccessStatusBadge.jsx';
import { formatDateTime } from '../../utils/projectAccessHelpers.js';

export function ProjectAccessDetailDrawer({ assignment, onClose, onEdit, onChangeMode, onAdjustDates }) {
  return (
    <DrawerPanel
      title="Detalle de la asignación"
      description="Consulte vigencia, modo de acceso y contexto del usuario sin perder la posición del listado."
      onClose={onClose}
    >
      <div className="space-y-6">
        <section className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-[#D1D5DB] bg-white text-[#1F4E79]">
              <UserRound size={22} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#2F3A45]">{assignment.userName}</h4>
              <p className="mt-1 text-sm text-gray-500">{assignment.userEmail}</p>
              <p className="mt-1 text-sm font-medium text-[#1F4E79]">{assignment.userRole}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <InfoCard label="Proyecto asignado" value={`${assignment.projectCode} · ${assignment.projectName}`} />
          <InfoCard label="Última actualización" value={formatDateTime(assignment.updatedAt)} />
          <InfoCard label="Modo de acceso" customValue={<AccessModeBadge accessMode={assignment.accessMode} />} />
          <InfoCard label="Estado actual" customValue={<ProjectAccessStatusBadge assignment={assignment} />} />
        </section>

        <DateRangeSummary assignment={assignment} />

        <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5">
          <p className="text-sm font-semibold text-[#2F3A45]">Observaciones</p>
          <p className="mt-2 text-sm text-gray-600">{assignment.notes}</p>
        </section>

        <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5">
          <p className="text-sm font-semibold text-[#2F3A45]">Acciones rápidas</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ActionButton icon={Pencil} label="Editar asignación" onClick={onEdit} />
            <ActionButton icon={ShieldCheck} label="Cambiar modo" onClick={onChangeMode} />
            <ActionButton icon={CalendarRange} label="Ajustar vigencia" onClick={onAdjustDates} />
            <ActionButton icon={Eye} label="Cerrar detalle" onClick={onClose} />
          </div>
        </section>
      </div>
    </DrawerPanel>
  );
}

function InfoCard({ label, value, customValue }) {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</p>
      <div className="mt-2 text-sm text-[#2F3A45]">{customValue ?? value}</div>
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