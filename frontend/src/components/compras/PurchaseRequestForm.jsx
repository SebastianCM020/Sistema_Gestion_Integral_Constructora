import React from 'react';
import { CirclePlus, RotateCcw, Save } from 'lucide-react';
import { RequestStatusBadge } from './RequestStatusBadge.jsx';

export function PurchaseRequestForm({
  projects,
  currentProjectId,
  draft,
  errors,
  detailSummary,
  hasMultipleProjects,
  onProjectChange,
  onJustificationChange,
  onOpenLineModal,
  onSubmit,
  onCancelDraft,
}) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">Formulario del requerimiento</h2>
          <p className="mt-1 text-sm text-gray-600">Complete la justificación y agregue materiales al detalle antes de guardar el requerimiento.</p>
        </div>
        <RequestStatusBadge status="draft" />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="purchase-project" className="block text-sm font-medium text-[#2F3A45]">Proyecto</label>
          <select
            id="purchase-project"
            value={currentProjectId}
            onChange={(event) => onProjectChange(event.target.value)}
            className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none"
          >
            <option value="">Seleccione el proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.code} · {project.name}</option>
            ))}
          </select>
          {hasMultipleProjects ? <p className="mt-2 text-xs text-gray-500">Puede cambiar el proyecto si el usuario tiene más de un acceso disponible.</p> : <p className="mt-2 text-xs text-gray-500">Solo tiene un proyecto accesible para este flujo.</p>}
          {errors.projectId ? <p className="mt-2 text-sm text-[#DC2626]">{errors.projectId}</p> : null}
        </div>

        <div>
          <label htmlFor="purchase-justification" className="block text-sm font-medium text-[#2F3A45]">Justificación</label>
          <textarea
            id="purchase-justification"
            value={draft.justification}
            onChange={(event) => onJustificationChange(event.target.value)}
            placeholder="Explique por qué se requiere la compra y a qué frente o actividad corresponde."
            className="mt-2 min-h-[120px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-sm text-[#2F3A45] outline-none placeholder:text-gray-400"
          />
          {errors.justification ? <p className="mt-2 text-sm text-[#DC2626]">{errors.justification}</p> : null}
        </div>

        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#2F3A45]">Detalle actual</p>
              <p className="mt-1 text-sm text-gray-600">{detailSummary.totalLines} línea{detailSummary.totalLines === 1 ? '' : 's'} agregada{detailSummary.totalLines === 1 ? '' : 's'} · {detailSummary.totalUnits} unidades acumuladas</p>
            </div>
            <button type="button" onClick={onOpenLineModal} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#1F4E79] px-4 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">
              <CirclePlus size={16} />
              Agregar material
            </button>
          </div>
          {errors.detail ? <p className="mt-3 text-sm text-[#DC2626]">{errors.detail}</p> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onSubmit} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
            <Save size={16} />
            Guardar requerimiento
          </button>
          <button type="button" onClick={onCancelDraft} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
            <RotateCcw size={16} />
            Cancelar borrador
          </button>
        </div>
      </div>
    </section>
  );
}