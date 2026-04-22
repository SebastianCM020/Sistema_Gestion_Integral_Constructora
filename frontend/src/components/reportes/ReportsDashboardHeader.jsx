import React from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { formatReportUpdatedAt } from '../../utils/reportHelpers.js';

export function ReportsDashboardHeader({ currentProject, currentPeriod, filterSummary, updatedAt, onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Panel principal</button>
        <span>/</span>
        <span className="font-medium text-[#1F4E79]">Reportes y dashboards</span>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
            <BarChart3 size={22} />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Reportes y dashboards</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">Consulte reportes y métricas del sistema con lectura ejecutiva, contable y operativa en una sola vista controlada por filtros.</p>
          {currentProject && currentPeriod ? <p className="mt-3 text-sm text-[#1F4E79]">Contexto activo: <span className="font-semibold">{currentProject.code} · {currentProject.name}</span> · <span className="font-semibold">{currentPeriod.label}</span>.</p> : null}
          <p className="mt-2 text-sm text-gray-600">{filterSummary}</p>
          <p className="mt-2 text-xs text-gray-500">Última actualización visible: {formatReportUpdatedAt(updatedAt)}</p>
        </div>

        <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
          <ArrowLeft size={16} />
          Volver al panel
        </button>
      </div>
    </section>
  );
}