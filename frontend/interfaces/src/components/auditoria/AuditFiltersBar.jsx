import React from 'react';
import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { AuditDateRangePicker } from './AuditDateRangePicker.jsx';
import { AuditUserSelector } from './AuditUserSelector.jsx';
import { AuditProjectSelector } from './AuditProjectSelector.jsx';

export function AuditFiltersBar({ filters, userOptions, projectOptions, moduleOptions, operationOptions, onChange, onClearFilters, onToggleAdvanced, isAdvancedOpen }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#2F3A45]"><Filter size={16} />Filtros de consulta</div>
      <div className="grid gap-4 xl:grid-cols-3">
        <AuditDateRangePicker dateFrom={filters.dateFrom} dateTo={filters.dateTo} onChange={onChange} />
        <AuditUserSelector options={userOptions} value={filters.userId} onChange={(userId) => onChange({ userId })} />
        <AuditProjectSelector options={projectOptions} value={filters.projectId} onChange={(projectId) => onChange({ projectId })} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_1.4fr_auto_auto]">
        <div>
          <label htmlFor="audit-module" className="block text-sm font-medium text-[#2F3A45]">Modulo</label>
          <select id="audit-module" value={filters.moduleId} onChange={(event) => onChange({ moduleId: event.target.value })} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            {moduleOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="audit-operation" className="block text-sm font-medium text-[#2F3A45]">Operacion</label>
          <select id="audit-operation" value={filters.operationType} onChange={(event) => onChange({ operationType: event.target.value })} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            {operationOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="audit-search" className="block text-sm font-medium text-[#2F3A45]">Referencia o request_id</label>
          <input id="audit-search" type="text" value={filters.search} onChange={(event) => onChange({ search: event.target.value })} placeholder="Ej. ACL-4431 o req-aud-9001" className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none" />
        </div>
        <div className="flex items-end">
          <button type="button" onClick={onToggleAdvanced} className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
            <SlidersHorizontal size={16} />
            {isAdvancedOpen ? 'Ocultar avanzados' : 'Mas filtros'}
          </button>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={onClearFilters} className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
            <RotateCcw size={16} />
            Limpiar filtros
          </button>
        </div>
      </div>
    </section>
  );
}