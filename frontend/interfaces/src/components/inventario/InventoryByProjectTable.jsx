import React from 'react';
import { Eye } from 'lucide-react';
import { InventoryStatusBadge } from './InventoryStatusBadge.jsx';
import { formatInventoryDate, getInventoryStatusMeta } from '../../utils/inventoryHelpers.js';

export function InventoryByProjectTable({ items, onOpenDetail }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm">
      <div className="hidden grid-cols-[1.1fr_1.8fr_110px_160px_160px_100px] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:grid">
        <span>Código</span>
        <span>Material</span>
        <span>Stock</span>
        <span>Ubicación</span>
        <span>Actualización</span>
        <span></span>
      </div>
      <div className="divide-y divide-[#D1D5DB]">
        {items.map((item) => {
          const meta = getInventoryStatusMeta(item);

          return (
            <div key={item.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.1fr_1.8fr_110px_160px_160px_100px] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Código</p>
                <p className="text-sm font-semibold text-[#2F3A45]">{item.code}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Material</p>
                <p className="text-sm text-[#2F3A45]">{item.name}</p>
                <div className="mt-2"><InventoryStatusBadge label={meta.label} tone={meta.tone} /></div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Stock</p>
                <p className="text-sm font-semibold text-[#2F3A45]">{item.availableQuantity} {item.unit}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Ubicación</p>
                <p className="text-sm text-gray-600">{item.warehouseLocation}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Actualización</p>
                <p className="text-sm text-gray-600">{formatInventoryDate(item.lastUpdatedAt)}</p>
              </div>
              <div className="flex justify-start md:justify-end">
                <button type="button" onClick={() => onOpenDetail(item)} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
                  <Eye size={14} /> Ver
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}