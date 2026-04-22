import React from 'react';
import { Building2, ChevronRight, FileSpreadsheet, Plus } from 'lucide-react';
import { ProjectSelector } from './ProjectSelector.jsx';

export function RubroHeader({ currentProjectId, projects, onChangeProject, onGoHome, onGoAdmin, onCreate, onImport }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Inicio</button>
        <ChevronRight size={14} />
        <button type="button" onClick={onGoAdmin} className="hover:text-[#1F4E79]">Administración</button>
        <ChevronRight size={14} />
        <span className="font-medium text-[#1F4E79]">Rubros y carga masiva</span>
      </div>

      <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,420px)] xl:items-start">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
              <Building2 size={22} />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Rubros y carga masiva</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">Gestione rubros y cargas masivas por proyecto con una operación clara, segura y lista para futura integración con API REST.</p>
          </div>

          <div className="space-y-4 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
            <ProjectSelector value={currentProjectId} projects={projects} onChange={onChangeProject} />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onCreate}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]"
              >
                <Plus size={18} />
                Nuevo rubro
              </button>
              <button
                type="button"
                onClick={onImport}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#1F4E79] bg-white px-4 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40"
              >
                <FileSpreadsheet size={18} />
                Importar CSV
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}