import React from 'react';

export function StockMovementInfoCard({ summary }) {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
      <p className="text-sm font-semibold text-[#2F3A45]">Resumen de recepción</p>
      <p className="mt-2 text-sm text-gray-600">Aprobado: <span className="font-semibold text-[#2F3A45]">{summary.totalApproved}</span> · Recibido: <span className="font-semibold text-[#2F3A45]">{summary.totalReceived}</span></p>
      <p className="mt-1 text-sm text-gray-600">Líneas con excedente detectado: <span className="font-semibold text-[#2F3A45]">{summary.excessCount}</span></p>
    </div>
  );
}