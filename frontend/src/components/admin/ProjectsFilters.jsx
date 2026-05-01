import React from 'react';

export function ProjectsFilters({ filters, managers, onChange, onReset }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <label htmlFor="projects-query" className="mb-1.5 block text-sm font-medium text-[#2F3A45]">
            Buscar por código, nombre o entidad contratante
          </label>
          <input
            id="projects-query"
            type="text"
            value={filters.query}
            onChange={(event) => onChange('query', event.target.value)}
            placeholder="Buscar por código, nombre o entidad contratante"
            className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
          />
        </div>

        <SelectField
          id="projects-status"
          label="Estado"
          value={filters.status}
          onChange={(value) => onChange('status', value)}
          options={[
            { value: 'all', label: 'Todos los estados' },
            { value: 'active', label: 'Activos' },
            { value: 'suspended', label: 'Suspendidos' },
            { value: 'closed', label: 'Cerrados' },
          ]}
        />

        <SelectField
          id="projects-manager"
          label="Responsable"
          value={filters.manager}
          onChange={(value) => onChange('manager', value)}
          options={[{ value: 'all', label: 'Todos los responsables' }, ...managers]}
        />

        <SelectField
          id="projects-sort"
          label="Ordenar por"
          value={filters.sortBy}
          onChange={(value) => onChange('sortBy', value)}
          options={[
            { value: 'updatedAt', label: 'Actualización reciente' },
            { value: 'name', label: 'Nombre del proyecto' },
            { value: 'code', label: 'Código' },
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