import React from 'react';
import { CircleCheckBig, List, Repeat } from 'lucide-react';
import { formatRequestDate } from '../../utils/purchaseRequestHelpers.js';
import { RequestStatusBadge } from './RequestStatusBadge.jsx';

export function PurchaseRequestSuccessState({ request, onCreateAnother, onViewList }) {
  return (
    <section className="rounded-[12px] border border-[#16A34A]/15 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#16A34A]/10 text-[#16A34A]">
          <CircleCheckBig size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">El requerimiento fue guardado correctamente</h2>
          <p className="mt-1 text-sm text-gray-600">El registro quedó creado y ya puede consultarse en el listado con su estado inicial.</p>
        </div>
      </div>

      <div className="mt-5 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
        <p><span className="font-semibold">ID:</span> {request.id.toUpperCase()}</p>
        <p className="mt-2"><span className="font-semibold">Proyecto:</span> {request.projectCode} · {request.projectName}</p>
        <p className="mt-2"><span className="font-semibold">Solicitante:</span> {request.requesterName}</p>
        <p className="mt-2"><span className="font-semibold">Fecha:</span> {formatRequestDate(request.requestedAt)}</p>
        <div className="mt-3"><RequestStatusBadge status={request.status} /></div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onCreateAnother} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
          <Repeat size={16} />
          Crear otro requerimiento
        </button>
        <button type="button" onClick={onViewList} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
          <List size={16} />
          Volver al listado
        </button>
      </div>
    </section>
  );
}