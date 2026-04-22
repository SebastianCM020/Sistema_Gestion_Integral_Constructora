import React from 'react';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';

export function InventoryMovementsHeader({ currentProject, summary, onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Panel principal</button>
        <span>/</span>
        <span className="font-medium text-[#1F4E79]">Control de movimientos de inventario</span>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
            <ArrowLeftRight size={22} />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Control de movimientos de inventario</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">Consulte entradas, salidas y alertas activas por proyecto para entender la trazabilidad logística del inventario.</p>
          {currentProject ? <p className="mt-3 text-sm text-[#1F4E79]">Proyecto activo: <span className="font-semibold">{currentProject.code} · {currentProject.name}</span> · {summary.activeAlerts} alerta{summary.activeAlerts === 1 ? '' : 's'} activa{summary.activeAlerts === 1 ? '' : 's'}.</p> : null}
        </div>

        <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
          <ArrowLeft size={16} />
          Volver al panel
        </button>
      </div>
    </section>
  );
}