import React from 'react';
import { Search } from 'lucide-react';

export function PurchaseRequestFilters({ filters, onChange, onReset }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
        <div>
          <label className="block text-sm font-medium text-[#2F3A45]" htmlFor="request-query">Buscar requerimiento</label>
          <div className="mt-2 flex items-center gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3">
            <Search size={16} className="text-[#1F4E79]" />
            <input
              id="request-query"
              type="text"
              value={filters.query}
              onChange={(event) => onChange('query', event.target.value)}
              placeholder="Buscar por proyecto, código o justificación"
              className="h-[44px] w-full bg-transparent text-sm text-[#2F3A45] outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2F3A45]" htmlFor="request-status">Estado</label>
          <select id="request-status" value={filters.status} onChange={(event) => onChange('status', event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            <option value="all">Todos</option>
            <option value="in-review">En revisión</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
            <option value="received">Recibido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2F3A45]" htmlFor="request-sort">Ordenar por</label>
          <select id="request-sort" value={filters.sortBy} onChange={(event) => onChange('sortBy', event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            <option value="updatedAt">Última actualización</option>
            <option value="requestedAt">Fecha de solicitud</option>
            <option value="project">Proyecto</option>
          </select>
        </div>

        <div className="flex items-end">
          <button type="button" onClick={onReset} className="inline-flex h-[44px] w-full items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Limpiar filtros</button>
        </div>
      </div>
    </section>
  );
}