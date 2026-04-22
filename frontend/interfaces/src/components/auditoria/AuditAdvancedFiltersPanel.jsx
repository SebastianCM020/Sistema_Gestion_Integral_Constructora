import React from 'react';

export function AuditAdvancedFiltersPanel({ filters, severityOptions, entityTypeOptions, onChange, onClose }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#2F3A45]">Filtros avanzados</h2>
          <p className="mt-1 text-sm text-gray-600">Refine la bitacora por severidad, tipo de entidad y eventos con trazabilidad ampliada.</p>
        </div>
        <button type="button" onClick={onClose} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar panel</button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div>
          <label htmlFor="audit-severity" className="block text-sm font-medium text-[#2F3A45]">Severidad</label>
          <select id="audit-severity" value={filters.severity} onChange={(event) => onChange({ severity: event.target.value })} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            {severityOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="audit-entity-type" className="block text-sm font-medium text-[#2F3A45]">Tipo de entidad</label>
          <select id="audit-entity-type" value={filters.entityType} onChange={(event) => onChange({ entityType: event.target.value })} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            {entityTypeOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="flex items-start gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          <input type="checkbox" checked={filters.onlyCritical} onChange={(event) => onChange({ onlyCritical: event.target.checked })} className="mt-1 h-4 w-4 rounded border-[#D1D5DB] text-[#1F4E79]" />
          <span>
            <span className="block font-semibold">Solo eventos criticos</span>
            <span className="mt-1 block text-gray-500">Muestre solo acciones sensibles o de alto seguimiento administrativo.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          <input type="checkbox" checked={filters.onlyWithChanges} onChange={(event) => onChange({ onlyWithChanges: event.target.checked })} className="mt-1 h-4 w-4 rounded border-[#D1D5DB] text-[#1F4E79]" />
          <span>
            <span className="block font-semibold">Solo eventos con comparacion</span>
            <span className="mt-1 block text-gray-500">Limite la consulta a registros que muestran cambios previos y posteriores.</span>
          </span>
        </label>
      </div>
    </section>
  );
}