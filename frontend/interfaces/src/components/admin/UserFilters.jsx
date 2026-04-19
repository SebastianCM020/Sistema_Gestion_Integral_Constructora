import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export function UserFilters({ filters, availableRoles, onChange, onReset }) {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="flex-1">
          <label htmlFor="user-search" className="block text-sm font-medium text-[#2F3A45] mb-1.5">
            Buscar por nombre o correo
          </label>
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="user-search"
              type="text"
              value={filters.query}
              onChange={(event) => onChange('query', event.target.value)}
              placeholder="Buscar por nombre, apellido o correo"
              className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-white pl-10 pr-3 text-sm text-[#111827] focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:w-[620px]">
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-[#2F3A45] mb-1.5">Rol</label>
            <select
              id="role-filter"
              value={filters.role}
              onChange={(event) => onChange('role', event.target.value)}
              className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
            >
              <option value="all">Todos los roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-[#2F3A45] mb-1.5">Estado de cuenta</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(event) => onChange('status', event.target.value)}
              className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-filter" className="block text-sm font-medium text-[#2F3A45] mb-1.5">Ordenar por</label>
            <select
              id="sort-filter"
              value={filters.sortBy}
              onChange={(event) => onChange('sortBy', event.target.value)}
              className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
            >
              <option value="name">Nombre</option>
              <option value="lastLogin">Último acceso</option>
              <option value="createdAt">Fecha de creación</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[#D1D5DB] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <SlidersHorizontal size={16} />
          Filtros preparados para crecer con futuras consultas por proyecto o permiso.
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}