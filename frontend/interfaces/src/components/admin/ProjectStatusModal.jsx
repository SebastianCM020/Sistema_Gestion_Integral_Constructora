import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { ProjectStatusBadge } from './ProjectStatusBadge.jsx';

export function ProjectStatusModal({ project, onCancel, onSave }) {
  const [nextStatus, setNextStatus] = useState(project.status);

  return (
    <ModalShell
      title="Cambiar estado del proyecto"
      description="Confirme el nuevo estado antes de guardar para evitar cambios accidentales o ambiguos."
      onClose={onCancel}
      widthClass="max-w-2xl"
    >
      <div className="space-y-5">
        <section className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <p className="text-sm font-semibold text-[#2F3A45]">{project.code} · {project.name}</p>
          <p className="mt-1 text-sm text-gray-500">{project.contractorEntity}</p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Estado actual</p>
            <div className="mt-3"><ProjectStatusBadge status={project.status} /></div>
          </div>
          <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
            <label htmlFor="project-status-next" className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Nuevo estado</label>
            <select
              id="project-status-next"
              value={nextStatus}
              onChange={(event) => setNextStatus(event.target.value)}
              className="mt-3 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
            >
              <option value="active">Activo</option>
              <option value="suspended">Suspendido</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-gray-600">
          Este cambio queda modelado como una futura operación PATCH o PUT. La tabla, el detalle y la parametrización reflejarán el nuevo estado inmediatamente después de guardar.
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
            Cancelar
          </button>
          <button type="button" onClick={() => onSave(nextStatus)} className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
            Confirmar cambios
          </button>
        </div>
      </div>
    </ModalShell>
  );
}