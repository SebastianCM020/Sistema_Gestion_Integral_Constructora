import React from 'react';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { EmptyMovementsState } from './EmptyMovementsState.jsx';
import { InventoryAlertsList } from './InventoryAlertsList.jsx';

export function InventoryAlertsPanel({ alerts, onOpenAlert, onOpenMovement }) {
  return (
    <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
      <SectionHeader title="Alertas del inventario" description="Revise excedentes y faltantes críticos relacionados con los movimientos recientes del proyecto." />
      {!alerts.length ? (
        <EmptyMovementsState title="No hay alertas activas en este momento" description="El proyecto actual no presenta excedentes ni stock insuficiente en el periodo filtrado." />
      ) : (
        <InventoryAlertsList alerts={alerts} onOpenAlert={onOpenAlert} onOpenMovement={onOpenMovement} />
      )}
    </section>
  );
}