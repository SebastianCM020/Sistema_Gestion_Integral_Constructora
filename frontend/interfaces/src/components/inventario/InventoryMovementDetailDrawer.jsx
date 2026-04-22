import React from 'react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { formatMovementDate, getMovementOriginMeta } from '../../utils/inventoryMovementHelpers.js';
import { MovementTypeBadge } from './MovementTypeBadge.jsx';
import { StockStatusBadge } from './StockStatusBadge.jsx';
import { MovementOriginLinkCard } from './MovementOriginLinkCard.jsx';

export function InventoryMovementDetailDrawer({ movement, canOpenOrigin, onOpenOrigin, onClose }) {
  const originMeta = getMovementOriginMeta(movement.originType);

  return (
    <DrawerPanel title="Detalle del movimiento" description="Consulte material, tipo, origen, fecha y stock antes y después del movimiento." onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          <p><span className="font-semibold">ID:</span> {movement.id}</p>
          <p className="mt-2"><span className="font-semibold">Material:</span> {movement.materialCode} · {movement.materialName}</p>
          <p className="mt-2"><span className="font-semibold">Proyecto:</span> {movement.projectCode} · {movement.projectName}</p>
          <p className="mt-2"><span className="font-semibold">Cantidad:</span> {movement.cantidad} {movement.unidad}</p>
          <p className="mt-2"><span className="font-semibold">Fecha:</span> {formatMovementDate(movement.fechaMovimiento)}</p>
          <p className="mt-2"><span className="font-semibold">Usuario asociado:</span> {movement.usuarioOrigen}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <MovementTypeBadge movementType={movement.movementType} />
            <StockStatusBadge movement={movement} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
            <p className="text-sm font-semibold text-[#2F3A45]">Stock anterior</p>
            <p className="mt-2 text-2xl font-semibold text-[#2F3A45]">{movement.stockAnterior}</p>
            <p className="mt-1 text-sm text-gray-500">{movement.unidad}</p>
          </div>
          <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
            <p className="text-sm font-semibold text-[#2F3A45]">Stock resultante</p>
            <p className="mt-2 text-2xl font-semibold text-[#2F3A45]">{movement.stockResultante}</p>
            <p className="mt-1 text-sm text-gray-500">{movement.unidad}</p>
          </div>
        </div>

        {movement.alertMessage ? (
          <div className="rounded-[12px] border border-[#F59E0B]/20 bg-[#FFF7ED] p-4 text-sm text-[#92400E]">
            <p className="font-semibold">Alerta asociada</p>
            <p className="mt-2">{movement.alertMessage}</p>
          </div>
        ) : null}

        <MovementOriginLinkCard title={originMeta.label} reference={movement.originReference} canOpen={canOpenOrigin} onOpen={onOpenOrigin} />
      </div>
    </DrawerPanel>
  );
}