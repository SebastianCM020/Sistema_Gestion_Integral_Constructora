import React from 'react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { RequestStatusBadge } from './RequestStatusBadge.jsx';
import { RequestLinesTable } from './RequestLinesTable.jsx';
import { RequestReviewTimeline } from './RequestReviewTimeline.jsx';
import { ReviewerActionBar } from './ReviewerActionBar.jsx';
import { canReviewRequest, formatReviewDate, getPriorityMeta } from '../../utils/requestReviewHelpers.js';

export function RequestReviewDetailDrawer({ request, onApprove, onReject, onBack }) {
  const priorityMeta = getPriorityMeta(request.priority);

  return (
    <DrawerPanel title="Detalle del requerimiento" description="Revise proyecto, solicitante, justificación, materiales y trazabilidad antes de decidir." onClose={onBack}>
      <div className="space-y-5">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          <p><span className="font-semibold">Código:</span> {request.code}</p>
          <p className="mt-2"><span className="font-semibold">Proyecto:</span> {request.projectCode} · {request.projectName}</p>
          <p className="mt-2"><span className="font-semibold">Solicitante:</span> {request.requesterName} · {request.requesterRole}</p>
          <p className="mt-2"><span className="font-semibold">Fecha de solicitud:</span> {formatReviewDate(request.fechaSolicitud)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <RequestStatusBadge status={request.estado} />
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${priorityMeta.className}`}>{priorityMeta.label}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#2F3A45]">Justificación</h4>
          <p className="mt-2 rounded-[12px] border border-[#D1D5DB] bg-white p-4 text-sm text-gray-600">{request.justificacion}</p>
        </div>

        {request.comentarioRechazo ? (
          <div>
            <h4 className="text-sm font-semibold text-[#2F3A45]">Observación de rechazo</h4>
            <p className="mt-2 rounded-[12px] border border-[#DC2626]/20 bg-[#FEE2E2]/60 p-4 text-sm text-[#991B1B]">{request.comentarioRechazo}</p>
          </div>
        ) : null}

        <div>
          <h4 className="text-sm font-semibold text-[#2F3A45]">Detalle de materiales</h4>
          <div className="mt-3">
            <RequestLinesTable lines={request.detail} />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#2F3A45]">Trazabilidad</h4>
          <div className="mt-3">
            <RequestReviewTimeline timeline={request.timeline} />
          </div>
        </div>

        <ReviewerActionBar canReview={canReviewRequest(request)} onApprove={onApprove} onReject={onReject} onBack={onBack} />
      </div>
    </DrawerPanel>
  );
}