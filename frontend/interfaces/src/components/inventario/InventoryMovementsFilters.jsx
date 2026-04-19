import React from 'react';
import { Search } from 'lucide-react';

export function InventoryMovementsFilters({ filters, materials, onChange, onReset }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_180px_240px_170px_auto]">
        <div>
          <label htmlFor="movement-query" className="block text-sm font-medium text-[#2F3A45]">Buscar movimiento</label>
          <div className="mt-2 flex items-center gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3">
            <Search size={16} className="text-[#1F4E79]" />
            <input id="movement-query" type="text" value={filters.query} onChange={(event) => onChange('query', event.target.value)} placeholder="Buscar por material o referencia" className="h-[44px] w-full bg-transparent text-sm text-[#2F3A45] outline-none placeholder:text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="movement-type" className="block text-sm font-medium text-[#2F3A45]">Tipo</label>
          <select id="movement-type" value={filters.movementType} onChange={(event) => onChange('movementType', event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            <option value="all">Todos</option>
            <option value="entry">Entradas</option>
            <option value="exit">Salidas</option>
          </select>
        </div>

        <div>
          <label htmlFor="movement-material" className="block text-sm font-medium text-[#2F3A45]">Material</label>
          <select id="movement-material" value={filters.materialId} onChange={(event) => onChange('materialId', event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            <option value="all">Todos los materiales</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>{material.code} · {material.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="movement-date-window" className="block text-sm font-medium text-[#2F3A45]">Periodo</label>
          <select id="movement-date-window" value={filters.dateWindow} onChange={(event) => onChange('dateWindow', event.target.value)} className="mt-2 h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3 text-sm text-[#2F3A45] outline-none">
            <option value="all">Todo el historial</option>
            <option value="today">Hoy</option>
            <option value="7d">Últimos 7 días</option>
          </select>
        </div>

        <div className="flex items-end">
          <button type="button" onClick={onReset} className="inline-flex h-[44px] w-full items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Limpiar filtros</button>
        </div>
      </div>

      <label className="mt-4 inline-flex items-center gap-3 text-sm text-[#2F3A45]">
        <input type="checkbox" checked={filters.alertsOnly} onChange={(event) => onChange('alertsOnly', event.target.checked)} className="h-4 w-4 rounded border-[#D1D5DB] text-[#1F4E79] focus:ring-[#1F4E79]" />
        Mostrar solo movimientos con alertas activas
      </label>
    </section>
  );
}