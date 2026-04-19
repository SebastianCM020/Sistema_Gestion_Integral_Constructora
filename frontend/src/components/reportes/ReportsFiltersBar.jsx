import React from 'react';
import { ProjectReportSelector } from './ProjectReportSelector.jsx';
import { PeriodReportSelector } from './PeriodReportSelector.jsx';

export function ReportsFiltersBar({ projects, periods, currentProjectId, currentPeriodId, dimensionFilter, onChangeProject, onChangePeriod, onChangeDimension, onReset }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_220px_auto]">
        <ProjectReportSelector projects={projects} currentProjectId={currentProjectId} onChange={onChangeProject} />
        <PeriodReportSelector periods={periods} currentPeriodId={currentPeriodId} onChange={onChangePeriod} />
        <div>
          <label htmlFor="reports-dimension" className="block text-sm font-medium text-[#2F3A45]">Dimensión</label>
          <select id="reports-dimension" value={dimensionFilter} onChange={(event) => onChangeDimension(event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            <option value="all">Todas las dimensiones</option>
            <option value="attention">Solo alertas o seguimientos</option>
            <option value="stable">Solo métricas estables</option>
          </select>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={onReset} className="inline-flex h-[44px] w-full items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Limpiar filtros</button>
        </div>
      </div>
    </section>
  );
}