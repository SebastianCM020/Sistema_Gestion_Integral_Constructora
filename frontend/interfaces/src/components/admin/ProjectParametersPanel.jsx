import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { ProjectParametersForm } from './ProjectParametersForm.jsx';
import { defaultProjectParametersValues } from '../../utils/projectHelpers.js';

export function ProjectParametersPanel({ project, parameters, onCancel, onSave }) {
  const [values, setValues] = useState({
    ...defaultProjectParametersValues,
    ...(parameters ?? {}),
  });

  const handleChange = (field, value) => {
    setValues((previousValues) => ({ ...previousValues, [field]: value }));
  };

  return (
    <ModalShell
      title="Parametrización operativa"
      description="Configure ajustes operativos del proyecto con una estructura clara y lista para crecer sin mezclar la ficha general."
      onClose={onCancel}
      widthClass="max-w-5xl"
    >
      <div className="space-y-5">
        <section className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <p className="text-sm font-semibold text-[#2F3A45]">{project.code} · {project.name}</p>
          <p className="mt-1 text-sm text-gray-500">{project.contractorEntity}</p>
        </section>

        <ProjectParametersForm values={values} onChange={handleChange} />

        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-gray-600">
          Esta configuración queda preparada para futura lectura y escritura desde backend, sin acoplar la parametrización a la ficha general del proyecto.
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
            Cancelar
          </button>
          <button type="button" onClick={() => onSave(values)} className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
            Guardar parámetros
          </button>
        </div>
      </div>
    </ModalShell>
  );
}