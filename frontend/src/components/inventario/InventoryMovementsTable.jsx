import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatMovementDate } from '../../utils/inventoryMovementHelpers.js';
import { MovementTypeBadge } from './MovementTypeBadge.jsx';
import { StockStatusBadge } from './StockStatusBadge.jsx';

export function InventoryMovementsTable({ movements, onOpenDetail }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm">
      <div className="hidden grid-cols-[160px_150px_1.5fr_100px_140px_140px_100px] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:grid">
        <span>Fecha</span>
        <span>Tipo</span>
        <span>Material</span>
        <span>Cantidad</span>
        <span>Proyecto</span>
        <span>Stock visible</span>
        <span></span>
      </div>

      <div className="divide-y divide-[#D1D5DB]">
        {movements.map((movement) => (
          <div key={movement.id} className="grid gap-4 px-4 py-4 md:grid-cols-[160px_150px_1.5fr_100px_140px_140px_100px] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Fecha</p>
              <p className="text-sm text-[#2F3A45]">{formatMovementDate(movement.fechaMovimiento)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Tipo</p>
              <MovementTypeBadge movementType={movement.movementType} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Material</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{movement.materialCode} · {movement.materialName}</p>
              <p className="mt-1 text-xs text-gray-500">Origen: {movement.originReference}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Cantidad</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{movement.cantidad} {movement.unidad}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Proyecto</p>
              <p className="text-sm text-[#2F3A45]">{movement.projectCode}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Stock visible</p>
              <p className="text-sm text-[#2F3A45]">{movement.stockResultante} {movement.unidad}</p>
              <div className="mt-2"><StockStatusBadge movement={movement} /></div>
            </div>
            <div className="flex justify-start md:justify-end">
              <button type="button" onClick={() => onOpenDetail(movement)} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
                Ver
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}