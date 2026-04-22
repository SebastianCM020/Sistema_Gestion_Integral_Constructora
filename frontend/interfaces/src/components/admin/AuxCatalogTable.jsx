import React from 'react';
import { SettingsStatusBadge } from './SettingsStatusBadge.jsx';

export function AuxCatalogTable({ items, onEdit, onOpenDetail }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white">
      <div className="hidden md:grid md:grid-cols-[1.1fr_1.4fr_0.7fr_0.7fr_0.9fr] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
        <span>Código</span>
        <span>Etiqueta</span>
        <span>Estado</span>
        <span>Orden</span>
        <span>Acciones</span>
      </div>
      <div className="divide-y divide-[#D1D5DB]">
        {items.map((item) => (
          <div key={item.itemId} className="grid gap-3 px-4 py-4 md:grid-cols-[1.1fr_1.4fr_0.7fr_0.7fr_0.9fr] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400 md:hidden">Código</p>
              <p className="text-sm font-medium text-[#2F3A45]">{item.itemCode || 'Sin código'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400 md:hidden">Etiqueta</p>
              <button type="button" onClick={() => onOpenDetail(item)} className="text-left text-sm font-medium text-[#1F4E79] hover:underline">{item.itemLabel}</button>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400 md:hidden">Estado</p>
              <SettingsStatusBadge tone={item.isActive ? 'success' : 'warning'} label={item.isActive ? 'Activo' : 'Inactivo'} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400 md:hidden">Orden</p>
              <p className="text-sm text-[#2F3A45]">{item.sortOrder ?? 'No aplica'}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => onEdit(item)} className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Editar</button>
              <button type="button" onClick={() => onOpenDetail(item)} className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Detalle</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}