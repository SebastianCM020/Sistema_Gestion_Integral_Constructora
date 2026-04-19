import React from 'react';
import { ArrowLeft, FolderSync, MapPinned } from 'lucide-react';
import { getProjectAccessLabel, getProjectContextText, getProjectDatesText } from '../../utils/progressHelpers.js';
import { ConsumptionPendingSyncBadge } from './ConsumptionPendingSyncBadge.jsx';

export function ConsumptionContextHeader({ currentProject, hasMultipleProjects, pendingSyncCount, onGoHome, onOpenProjectModal }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
      <button type="button" onClick={onGoHome} className="inline-flex h-[40px] items-center gap-2 rounded-[12px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
        <ArrowLeft size={16} />
        Volver al panel
      </button>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#1F4E79]">Registro mobile-first para consumo en campo</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#2F3A45]">Consumo en obra</h1>
          <p className="mt-2 text-sm text-gray-600">Seleccione proyecto y material, valide stock y registre el consumo con una interacción clara y rápida desde móvil.</p>
        </div>
        <ConsumptionPendingSyncBadge count={pendingSyncCount} />
      </div>

      <div className="mt-5 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Proyecto activo</p>
            <p className="mt-1 text-base font-semibold text-[#2F3A45]">{getProjectContextText(currentProject)}</p>
            <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
              <div className="inline-flex items-center gap-2">
                <MapPinned size={14} className="text-[#1F4E79]" />
                {getProjectAccessLabel(currentProject.accessMode)}
              </div>
              <div className="inline-flex items-center gap-2">
                <FolderSync size={14} className="text-[#1F4E79]" />
                {getProjectDatesText(currentProject)}
              </div>
            </div>
          </div>

          {hasMultipleProjects ? (
            <button type="button" onClick={onOpenProjectModal} className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[#1F4E79] px-4 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">
              Cambiar proyecto
            </button>
          ) : null}
        </div>

        {!hasMultipleProjects ? <p className="mt-3 text-sm text-gray-500">Solo tiene un proyecto asignado para esta jornada.</p> : null}
      </div>
    </section>
  );
}