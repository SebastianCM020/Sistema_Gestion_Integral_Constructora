import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { formatReportMetricValue } from '../../utils/reportHelpers.js';

export function KpiDefinitionModal({ item, contextLabel, onClose }) {
  if (!item) {
    return null;
  }

  const value = item.value !== undefined ? formatReportMetricValue(item) : `${item.segments?.length ?? 0} segmentos visibles`;
  const definition = item.definition || 'Esta visualización resume la información principal para el filtro actual.';
  const note = item.contextNote || 'La métrica corresponde al proyecto y periodo actualmente filtrados.';
  const title = item.label || item.title;

  return (
    <ModalShell title="Definición de la métrica seleccionada" description="Use esta referencia para interpretar la cifra o visualización dentro del contexto activo." onClose={onClose} widthClass="max-w-lg">
      <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
        <p><span className="font-semibold">Métrica:</span> {title}</p>
        <p className="mt-2"><span className="font-semibold">Valor visible:</span> {value}</p>
        <p className="mt-2"><span className="font-semibold">Contexto:</span> {contextLabel}</p>
      </div>
      <div className="mt-5 space-y-4 text-sm text-gray-600">
        <p>{definition}</p>
        <p>{note}</p>
      </div>
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Cerrar</button>
      </div>
    </ModalShell>
  );
}