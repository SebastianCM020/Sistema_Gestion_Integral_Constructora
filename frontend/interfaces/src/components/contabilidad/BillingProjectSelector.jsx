import React from 'react';

export function BillingProjectSelector({ projects, currentProjectId, onChange }) {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <label htmlFor="billing-project" className="block text-sm font-medium text-[#2F3A45]">Proyecto</label>
      <select id="billing-project" value={currentProjectId} onChange={(event) => onChange(event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
        {projects.map((project) => (
          <option key={project.id} value={project.id}>{project.code} · {project.name}</option>
        ))}
      </select>
      <p className="mt-2 text-xs text-gray-500">Solo se muestran proyectos autorizados para su ámbito funcional.</p>
    </div>
  );
}