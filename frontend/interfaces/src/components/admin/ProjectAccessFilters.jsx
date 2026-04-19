import React from 'react';

export function ProjectAccessFilters({ filters, projects, roles, onChange, onReset }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_repeat(5,minmax(0,1fr))]">
        <div>
          <label htmlFor="access-query" className="mb-1.5 block text-sm font-medium text-[#2F3A45]">
            Buscar por usuario o correo
          </label>
          <input
            id="access-query"
            type="text"
            value={filters.query}
            onChange={(event) => onChange('query', event.target.value)}
            placeholder="Buscar por usuario o correo"
            className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
          />
        </div>

        <SelectField
          id="access-project"
          label="Proyecto"
          value={filters.projectId}
          onChange={(value) => onChange('projectId', value)}
          options={[{ value: 'all', label: 'Todos los proyectos' }, ...projects.map((project) => ({ value: project.id, label: project.name }))]}
        />

        <SelectField
          id="access-role"
          label="Rol"
          value={filters.role}
          onChange={(value) => onChange('role', value)}
          options={[{ value: 'all', label: 'Todos los roles' }, ...roles.map((role) => ({ value: role, label: role }))]}
        />

        <SelectField
          id="access-status"
          label="Estado"
          value={filters.status}
          onChange={(value) => onChange('status', value)}
          options={[
            { value: 'all', label: 'Todos los estados' },
            { value: 'active', label: 'Activas' },
            { value: 'expired', label: 'Expiradas' },
            { value: 'readonly', label: 'Solo lectura' },
            { value: 'revoked', label: 'Revocadas' },
          ]}
        />

        <SelectField
          id="access-mode"
          label="Modo de acceso"
          value={filters.accessMode}
          onChange={(value) => onChange('accessMode', value)}
          options={[
            { value: 'all', label: 'Todos los modos' },
            { value: 'active', label: 'Activo' },
            { value: 'readonly', label: 'Solo lectura' },
            { value: 'revoked', label: 'Revocado' },
          ]}
        />

        <SelectField
          id="access-sort"
          label="Ordenar por"
          value={filters.sortBy}
          onChange={(value) => onChange('sortBy', value)}
          options={[
            { value: 'updatedAt', label: 'Actualización reciente' },
            { value: 'userName', label: 'Usuario' },
            { value: 'projectName', label: 'Proyecto' },
            { value: 'startDate', label: 'Fecha de inicio' },
          ]}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]"
        >
          Limpiar filtros
        </button>
      </div>
    </section>
  );
}

function SelectField({ id, label, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#2F3A45]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}