import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatMovementDate } from '../../utils/inventoryMovementHelpers.js';
import { getAlertSeverityMeta, getAlertTypeMeta } from '../../utils/inventoryAlertHelpers.js';
import { InventoryStatusBadge } from './InventoryStatusBadge.jsx';

export function InventoryAlertsList({ alerts, onOpenAlert, onOpenMovement }) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const typeMeta = getAlertTypeMeta(alert.tipoAlerta);
        const severityMeta = getAlertSeverityMeta(alert.severidad);

        return (
          <article key={alert.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <InventoryStatusBadge label={typeMeta.label} tone={typeMeta.tone} />
                  <InventoryStatusBadge label={severityMeta.label} tone={severityMeta.tone} />
                </div>
                <p className="mt-3 text-sm font-semibold text-[#2F3A45]">{alert.materialCode} · {alert.materialName}</p>
                <p className="mt-1 text-sm text-gray-600">{alert.mensaje}</p>
                <p className="mt-2 text-xs text-gray-500">{alert.projectCode} · {formatMovementDate(alert.fecha)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => onOpenAlert(alert)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Ver alerta</button>
                <button type="button" onClick={() => onOpenMovement(alert.movementId)} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
                  Ver movimiento
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}