import React from 'react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { formatRequestDate } from '../../utils/purchaseRequestHelpers.js';
import { RequestStatusBadge } from './RequestStatusBadge.jsx';
import { RequestDetailTable } from './RequestDetailTable.jsx';

export function PurchaseRequestDetailDrawer({ request, onClose }) {
  return (
    <DrawerPanel title="Detalle del requerimiento" description="Consulte proyecto, solicitante, justificación, estado y materiales asociados." onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          <p><span className="font-semibold">ID:</span> {request.id.toUpperCase()}</p>
          <p className="mt-2"><span className="font-semibold">Proyecto:</span> {request.projectCode} · {request.projectName}</p>
          <p className="mt-2"><span className="font-semibold">Solicitante:</span> {request.requesterName} · {request.requesterRole}</p>
          <p className="mt-2"><span className="font-semibold">Fecha de solicitud:</span> {formatRequestDate(request.requestedAt)}</p>
          {request.approvedAt ? <p className="mt-2"><span className="font-semibold">Fecha de aprobación:</span> {formatRequestDate(request.approvedAt)}</p> : null}
          <div className="mt-3"><RequestStatusBadge status={request.status} /></div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#2F3A45]">Justificación</h4>
          <p className="mt-2 rounded-[12px] border border-[#D1D5DB] bg-white p-4 text-sm text-gray-600">{request.justification}</p>
        </div>

        {request.rejectionComment ? (
          <div>
            <h4 className="text-sm font-semibold text-[#2F3A45]">Comentario de rechazo</h4>
            <p className="mt-2 rounded-[12px] border border-[#DC2626]/20 bg-[#FEE2E2]/50 p-4 text-sm text-[#991B1B]">{request.rejectionComment}</p>
          </div>
        ) : null}

        <div>
          <h4 className="text-sm font-semibold text-[#2F3A45]">Detalle de materiales</h4>
          <div className="mt-3">
            <RequestDetailTable lines={request.detail} />
          </div>
        </div>
      </div>
    </DrawerPanel>
  );
}