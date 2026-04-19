import React from 'react';

export function ProjectInventorySelector({ projects, currentProjectId, onChange }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">Proyecto operativo</h2>
          <p className="mt-1 text-sm text-gray-600">Seleccione el proyecto o bodega sobre el que desea registrar recepciones y consultar inventario.</p>
        </div>
        <div>
          <label htmlFor="inventory-project" className="block text-sm font-medium text-[#2F3A45]">Proyecto</label>
          <select id="inventory-project" value={currentProjectId} onChange={(event) => onChange(event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.code} · {project.name}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">{projects.length > 1 ? 'Puede cambiar entre proyectos autorizados para su operación de bodega.' : 'Solo tiene un proyecto autorizado para esta sesión.'}</p>
        </div>
      </div>
    </section>
  );
}