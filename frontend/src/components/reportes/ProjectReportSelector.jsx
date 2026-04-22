import React from 'react';

export function ProjectReportSelector({ projects, currentProjectId, onChange }) {
  return (
    <div>
      <label htmlFor="reports-project" className="block text-sm font-medium text-[#2F3A45]">Proyecto</label>
      <select id="reports-project" value={currentProjectId} onChange={(event) => onChange(event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
        {projects.map((project) => (
          <option key={project.id} value={project.id}>{project.code} · {project.name}</option>
        ))}
      </select>
    </div>
  );
}