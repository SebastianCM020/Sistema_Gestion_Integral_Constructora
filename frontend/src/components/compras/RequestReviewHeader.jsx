import React from 'react';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';

export function RequestReviewHeader({ pendingCount, currentUser, onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Panel principal</button>
        <span>/</span>
        <span className="font-medium text-[#1F4E79]">Revisión de requerimientos</span>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
            <ClipboardCheck size={22} />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Revisión de requerimientos</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">Revise los requerimientos pendientes, valide su justificación y tome decisiones de aprobación o rechazo con trazabilidad clara.</p>
          <p className="mt-3 text-sm text-[#1F4E79]">Revisor activo: <span className="font-semibold">{currentUser.name}</span> · {currentUser.roleName} · {pendingCount} pendiente{pendingCount === 1 ? '' : 's'} por resolver.</p>
        </div>

        <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
          <ArrowLeft size={16} />
          Volver al panel
        </button>
      </div>
    </section>
  );
}