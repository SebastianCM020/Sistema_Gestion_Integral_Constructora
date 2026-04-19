import React from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { InventoryStatusBadge } from './InventoryStatusBadge.jsx';
import { ReceptionDetailTable } from './ReceptionDetailTable.jsx';
import { StockMovementInfoCard } from './StockMovementInfoCard.jsx';

export function ReceptionForm({ request, draft, errors, summary, onChangeQuantity, onCancel, onSubmit }) {
  return (
    <section className="space-y-4 rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">Registro de recepción</h2>
          <p className="mt-1 text-sm text-gray-600">Ingrese las cantidades recibidas para cada material aprobado y confirme el ingreso al stock del proyecto.</p>
          <p className="mt-2 text-sm text-[#1F4E79]">{request.requestCode} · {request.projectCode} · Solicitante: {request.requesterName}</p>
        </div>
        <InventoryStatusBadge label="Aprobado disponible" tone="info" />
      </div>

      {errors.requestId ? <p className="text-sm text-[#DC2626]">{errors.requestId}</p> : null}
      {errors.lines ? <p className="text-sm text-[#DC2626]">{errors.lines}</p> : null}

      <StockMovementInfoCard summary={summary} />

      <ReceptionDetailTable lines={draft.lines} errors={errors.lineErrors} onChange={onChangeQuantity} />

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onSubmit} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
          <Save size={16} />
          Confirmar recepción
        </button>
        <button type="button" onClick={onCancel} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
          <RotateCcw size={16} />
          Cancelar cambios
        </button>
      </div>
    </section>
  );
}