import React from 'react';
import { CircleCheckBig, ListChecks, PackagePlus } from 'lucide-react';
import { formatInventoryDate } from '../../utils/inventoryHelpers.js';

export function ReceptionSuccessState({ receptionRecord, requestCode, onBackToList, onReviewInventory }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#16A34A]/10 text-[#16A34A]">
          <CircleCheckBig size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">La recepción fue registrada correctamente</h2>
          <p className="mt-1 text-sm text-gray-600">El stock del proyecto fue actualizado con las cantidades recibidas y la recepción quedó lista para trazabilidad futura.</p>
        </div>
      </div>

      <div className="mt-5 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
        <p><span className="font-semibold">Requerimiento:</span> {requestCode}</p>
        <p className="mt-2"><span className="font-semibold">Fecha de recepción:</span> {formatInventoryDate(receptionRecord.receptionDate)}</p>
        <p className="mt-2"><span className="font-semibold">Materiales actualizados:</span> {receptionRecord.detail.length}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onBackToList} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
          <ListChecks size={16} /> Volver al listado
        </button>
        <button type="button" onClick={onReviewInventory} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
          <PackagePlus size={16} /> Revisar inventario actualizado
        </button>
      </div>
    </section>
  );
}