import React from 'react';
import { getMovementTypeMeta } from '../../utils/inventoryMovementHelpers.js';
import { InventoryStatusBadge } from './InventoryStatusBadge.jsx';

export function MovementTypeBadge({ movementType }) {
  const meta = getMovementTypeMeta(movementType);

  return <InventoryStatusBadge label={meta.label} tone={meta.tone} />;
}