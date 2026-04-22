import React from 'react';
import { Boxes, ChevronRight, Plus } from 'lucide-react';

export function MaterialHeader({ onGoHome, onGoAdmin, onCreate }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Inicio</button>
        <ChevronRight size={14} />
        <button type="button" onClick={onGoAdmin} className="hover:text-[#1F4E79]">Administración</button>
        <ChevronRight size={14} />
        <span className="font-medium text-[#1F4E79]">Catálogo y materiales</span>
      </div>

      <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
              <Boxes size={22} />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Catálogo y materiales</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">Gestione el catálogo de materiales del sistema, mantenga referencias vigentes y deje la estructura lista para futura integración con backend real.</p>
          </div>

          <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 xl:min-w-[280px]">
            <p className="text-sm text-gray-500">Acción principal</p>
            <button
              type="button"
              onClick={onCreate}
              className="mt-3 inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]"
            >
              <Plus size={18} />
              Nuevo material
            </button>
          </div>
        </div>
      </section>
    </>
  );
}