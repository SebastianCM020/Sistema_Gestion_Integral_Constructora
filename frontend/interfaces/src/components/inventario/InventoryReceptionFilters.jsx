import React from 'react';
import { Search } from 'lucide-react';

export function InventoryReceptionFilters({ filters, onChange, onReset }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div>
          <label htmlFor="approved-request-query" className="block text-sm font-medium text-[#2F3A45]">Buscar requerimiento aprobado</label>
          <div className="mt-2 flex items-center gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3">
            <Search size={16} className="text-[#1F4E79]" />
            <input id="approved-request-query" type="text" value={filters.requestQuery} onChange={(event) => onChange('requestQuery', event.target.value)} placeholder="Buscar por código, proyecto o solicitante" className="h-[44px] w-full bg-transparent text-sm text-[#2F3A45] outline-none placeholder:text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="inventory-material-query" className="block text-sm font-medium text-[#2F3A45]">Buscar material en inventario</label>
          <div className="mt-2 flex items-center gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3">
            <Search size={16} className="text-[#1F4E79]" />
            <input id="inventory-material-query" type="text" value={filters.inventoryQuery} onChange={(event) => onChange('inventoryQuery', event.target.value)} placeholder="Buscar por código o material" className="h-[44px] w-full bg-transparent text-sm text-[#2F3A45] outline-none placeholder:text-gray-400" />
          </div>
        </div>

        <div className="flex items-end">
          <button type="button" onClick={onReset} className="inline-flex h-[44px] w-full items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Limpiar filtros</button>
        </div>
      </div>
    </section>
  );
}