import React from 'react';
import { getStockStatusMeta } from '../../utils/inventoryMovementHelpers.js';
import { InventoryStatusBadge } from './InventoryStatusBadge.jsx';

export function StockStatusBadge({ movement }) {
  const meta = getStockStatusMeta(movement);

  return <InventoryStatusBadge label={meta.label} tone={meta.tone} />;
}