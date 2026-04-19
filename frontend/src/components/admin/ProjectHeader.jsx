import React from 'react';
import { ChevronRight, FolderCog, Plus } from 'lucide-react';

export function ProjectHeader({ onGoHome, onGoAdmin, onCreate }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Inicio</button>
        <ChevronRight size={14} />
        <button type="button" onClick={onGoAdmin} className="hover:text-[#1F4E79]">Administración</button>
        <ChevronRight size={14} />
        <span className="font-medium text-[#1F4E79]">Gestión de proyectos y parametrización</span>
      </div>

      <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
              <FolderCog size={22} />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Gestión de proyectos y parametrización</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">Gestione proyectos y parámetros operativos del sistema con una estructura preparada para futura integración con API REST y reglas reales de negocio.</p>
          </div>

          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]"
          >
            <Plus size={18} />
            Nuevo proyecto
          </button>
        </div>
      </section>
    </>
  );
}