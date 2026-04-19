import React from 'react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { buildMetricDetailContent } from '../../utils/dashboardHelpers.js';

export function MetricDetailDrawer({ item, contextLabel, onClose }) {
  const content = buildMetricDetailContent(item, contextLabel);

  if (!content) {
    return null;
  }

  return (
    <DrawerPanel title="Detalle de la métrica seleccionada" description="Esta cifra corresponde al proyecto, periodo y vista actualmente filtrados." onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <p className="text-sm font-semibold text-[#2F3A45]">{content.title}</p>
          <p className="mt-2 text-3xl font-semibold text-[#111827]">{content.value}</p>
          <p className="mt-2 text-sm text-gray-600">{content.subtitle}</p>
        </div>

        <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
          <p className="text-sm font-semibold text-[#2F3A45]">Explicación</p>
          <p className="mt-2 text-sm text-gray-600">{content.description}</p>
        </div>

        <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
          <p className="text-sm font-semibold text-[#2F3A45]">Contexto adicional</p>
          <p className="mt-2 text-sm text-gray-600">{content.note}</p>
        </div>
      </div>
    </DrawerPanel>
  );
}