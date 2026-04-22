import React from 'react';
import { CircleCheckBig, Home, Repeat } from 'lucide-react';
import { formatConsumptionDate, formatConsumptionQuantity } from '../../utils/consumptionHelpers.js';
import { ConsumptionPendingSyncBadge } from './ConsumptionPendingSyncBadge.jsx';

export function ConsumptionSuccessState({ record, onRegisterAnother, onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#16A34A]/15 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#16A34A]/10 text-[#16A34A]">
          <CircleCheckBig size={24} />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-[#2F3A45]">El consumo fue registrado correctamente</h2>
          <p className="mt-1 text-sm text-gray-600">El registro quedó listo para sincronización y puede continuar con otra tarea sin perder contexto del proyecto.</p>
        </div>
      </div>

      <div className="mt-5 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
        <p><span className="font-semibold">Proyecto:</span> {record.projectCode} · {record.projectName}</p>
        <p className="mt-2"><span className="font-semibold">Material:</span> {record.materialCode} · {record.materialName}</p>
        <p className="mt-2"><span className="font-semibold">Cantidad registrada:</span> {formatConsumptionQuantity(record.quantityConsumed)} {record.unit}</p>
        <p className="mt-2"><span className="font-semibold">Fecha:</span> {formatConsumptionDate(record.registeredAt)}</p>
        <div className="mt-3"><ConsumptionPendingSyncBadge syncStatus={record.syncStatus} /></div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onRegisterAnother} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
          <Repeat size={16} />
          Registrar otro consumo
        </button>
        <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
          <Home size={16} />
          Volver al panel
        </button>
      </div>
    </section>
  );
}