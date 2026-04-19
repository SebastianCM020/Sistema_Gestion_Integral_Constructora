import React from 'react';

export function ProjectSelector({ value, projects, error, onChange }) {
  return (
    <div>
      <label htmlFor="assignment-project" className="mb-1.5 block text-sm font-medium text-[#2F3A45]">
        Proyecto
      </label>
      <select
        id="assignment-project"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[44px] w-full rounded-[12px] border px-3 text-sm focus:outline-none focus:ring-1 ${error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'}`}
      >
        <option value="">Seleccione un proyecto</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.code} · {project.name}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p> : null}
    </div>
  );
}