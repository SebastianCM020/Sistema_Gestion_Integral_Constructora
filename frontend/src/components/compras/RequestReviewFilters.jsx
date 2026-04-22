import React from 'react';
import { Search } from 'lucide-react';

export function RequestReviewFilters({ filters, projects, onChange, onReset }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_170px_220px_160px_auto]">
        <div>
          <label className="block text-sm font-medium text-[#2F3A45]" htmlFor="review-query">Buscar</label>
          <div className="mt-2 flex items-center gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3">
            <Search size={16} className="text-[#1F4E79]" />
            <input
              id="review-query"
              type="text"
              value={filters.query}
              onChange={(event) => onChange('query', event.target.value)}
              placeholder="Buscar por proyecto, solicitante o código"
              className="h-[44px] w-full bg-transparent text-sm text-[#2F3A45] outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2F3A45]" htmlFor="review-status">Estado</label>
          <select id="review-status" value={filters.estado} onChange={(event) => onChange('estado', event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            <option value="all">Todos</option>
            <option value="in-review">En revisión</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2F3A45]" htmlFor="review-project">Proyecto</label>
          <select id="review-project" value={filters.projectId} onChange={(event) => onChange('projectId', event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            <option value="all">Todos los proyectos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.code} · {project.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2F3A45]" htmlFor="review-priority">Prioridad</label>
          <select id="review-priority" value={filters.priority} onChange={(event) => onChange('priority', event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            <option value="all">Todas</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="normal">Normal</option>
          </select>
        </div>

        <div className="flex items-end">
          <button type="button" onClick={onReset} className="inline-flex h-[44px] w-full items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Limpiar filtros</button>
        </div>
      </div>
    </section>
  );
}