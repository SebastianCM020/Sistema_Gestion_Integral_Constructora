import React from 'react';
import { CircleCheckBig, CircleSlash2, ListChecks, StepForward } from 'lucide-react';
import { formatReviewDate } from '../../utils/requestReviewHelpers.js';
import { RequestStatusBadge } from './RequestStatusBadge.jsx';

export function RequestReviewSuccessState({ result, nextPendingRequest, onBackToList, onContinue }) {
  const isApproved = result.request.estado === 'approved';
  const Icon = isApproved ? CircleCheckBig : CircleSlash2;
  const title = isApproved ? 'El requerimiento fue aprobado' : 'El requerimiento fue rechazado';

  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[12px] ${isApproved ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
          <Icon size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2F3A45]">{title}</h2>
          <p className="mt-1 text-sm text-gray-600">La decisión quedó registrada y el flujo puede continuar sin perder el contexto de la bandeja.</p>
        </div>
      </div>

      <div className="mt-5 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
        <p><span className="font-semibold">Código:</span> {result.request.code}</p>
        <p className="mt-2"><span className="font-semibold">Proyecto:</span> {result.request.projectCode} · {result.request.projectName}</p>
        <p className="mt-2"><span className="font-semibold">Fecha de revisión:</span> {formatReviewDate(result.request.fechaRevision)}</p>
        {!isApproved ? <p className="mt-2"><span className="font-semibold">Observación:</span> {result.request.comentarioRechazo}</p> : null}
        <div className="mt-3"><RequestStatusBadge status={result.request.estado} /></div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onBackToList} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
          <ListChecks size={16} />
          Volver al listado
        </button>
        <button type="button" onClick={onContinue} disabled={!nextPendingRequest} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c] disabled:cursor-not-allowed disabled:bg-[#1F4E79]/50">
          <StepForward size={16} />
          {nextPendingRequest ? 'Continuar con el siguiente pendiente' : 'No hay más pendientes'}
        </button>
      </div>
    </section>
  );
}