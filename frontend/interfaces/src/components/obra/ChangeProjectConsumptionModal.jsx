import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { ProjectConsumptionSelector } from './ProjectConsumptionSelector.jsx';

export function ChangeProjectConsumptionModal({ projects, currentProjectId, hasDraft, onCancel, onConfirm }) {
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId);

  return (
    <ModalShell
      title="Cambiar proyecto"
      description="Seleccione uno de los proyectos asignados para continuar con el registro de consumo."
      onClose={onCancel}
      widthClass="max-w-3xl"
    >
      <div className="space-y-5">
        {hasDraft ? (
          <div className="rounded-[12px] border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#9A6700]">
            Cambiar de proyecto limpiará el material seleccionado y el borrador actual para evitar inconsistencias de contexto.
          </div>
        ) : null}

        <ProjectConsumptionSelector projects={projects} selectedProjectId={selectedProjectId} onSelect={setSelectedProjectId} />

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">Cancelar</button>
          <button type="button" onClick={() => onConfirm(selectedProjectId)} className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Confirmar proyecto</button>
        </div>
      </div>
    </ModalShell>
  );
}