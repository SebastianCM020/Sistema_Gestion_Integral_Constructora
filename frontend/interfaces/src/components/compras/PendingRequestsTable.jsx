import React from 'react';
import { ChevronRight } from 'lucide-react';
import { RequestStatusBadge } from './RequestStatusBadge.jsx';
import { formatReviewDate, getPriorityMeta } from '../../utils/requestReviewHelpers.js';

export function PendingRequestsTable({ requests, onOpenDetail }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm">
      <div className="hidden grid-cols-[140px_1.4fr_1.1fr_130px_120px_110px] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:grid">
        <span>Código</span>
        <span>Proyecto</span>
        <span>Solicitante</span>
        <span>Estado</span>
        <span>Prioridad</span>
        <span></span>
      </div>

      <div className="divide-y divide-[#D1D5DB]">
        {requests.map((request) => {
          const priorityMeta = getPriorityMeta(request.priority);

          return (
            <div key={request.id} className="grid gap-4 px-4 py-4 md:grid-cols-[140px_1.4fr_1.1fr_130px_120px_110px] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Código</p>
                <p className="text-sm font-semibold text-[#2F3A45]">{request.code}</p>
                <p className="mt-1 text-xs text-gray-500">{formatReviewDate(request.fechaSolicitud)}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Proyecto</p>
                <p className="text-sm font-semibold text-[#2F3A45]">{request.projectCode} · {request.projectName}</p>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{request.detail.length} línea{request.detail.length === 1 ? '' : 's'} · {request.justificacion}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Solicitante</p>
                <p className="text-sm text-[#2F3A45]">{request.requesterName}</p>
                <p className="mt-1 text-xs text-gray-500">{request.requesterRole}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Estado</p>
                <RequestStatusBadge status={request.estado} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:hidden">Prioridad</p>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${priorityMeta.className}`}>{priorityMeta.label}</span>
              </div>

              <div className="flex justify-start md:justify-end">
                <button type="button" onClick={() => onOpenDetail(request)} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
                  Revisar
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}