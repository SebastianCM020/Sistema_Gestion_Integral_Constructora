import React from 'react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { InventoryStatusBadge } from './InventoryStatusBadge.jsx';
import { formatInventoryDate, getInventoryStatusMeta } from '../../utils/inventoryHelpers.js';

export function InventoryDetailDrawer({ item, onClose }) {
  const meta = getInventoryStatusMeta(item);

  return (
    <DrawerPanel title="Detalle de inventario" description="Consulte disponibilidad, ubicación y estado del material seleccionado." onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          <p><span className="font-semibold">Código:</span> {item.code}</p>
          <p className="mt-2"><span className="font-semibold">Material:</span> {item.name}</p>
          <p className="mt-2"><span className="font-semibold">Stock disponible:</span> {item.availableQuantity} {item.unit}</p>
          <p className="mt-2"><span className="font-semibold">Umbral mínimo:</span> {item.minimumThreshold} {item.unit}</p>
          <p className="mt-2"><span className="font-semibold">Ubicación:</span> {item.warehouseLocation}</p>
          <p className="mt-2"><span className="font-semibold">Última actualización:</span> {formatInventoryDate(item.lastUpdatedAt)}</p>
          <div className="mt-3"><InventoryStatusBadge label={meta.label} tone={meta.tone} /></div>
        </div>
      </div>
    </DrawerPanel>
  );
}