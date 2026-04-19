import React from 'react';
import { ArrowLeft, ClipboardList } from 'lucide-react';

export function PurchaseRequestHeader({ currentProject, hasMultipleProjects, onGoHome, onCreateNew }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Panel principal</button>
        <span>/</span>
        <span className="font-medium text-[#1F4E79]">Requerimientos de compra</span>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
            <ClipboardList size={22} />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Requerimientos de compra</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">Cree requerimientos por proyecto, agregue materiales del catálogo y consulte su estado sin perder el contexto del flujo administrativo.</p>
          {currentProject ? (
            <p className="mt-3 text-sm text-[#1F4E79]">Proyecto activo: <span className="font-semibold">{currentProject.code} · {currentProject.name}</span>{hasMultipleProjects ? ' · puede cambiarlo desde el formulario.' : ''}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
            <ArrowLeft size={16} />
            Volver al panel
          </button>
          <button type="button" onClick={onCreateNew} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
            Nuevo requerimiento
          </button>
        </div>
      </div>
    </section>
  );
}