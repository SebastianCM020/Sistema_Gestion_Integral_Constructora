import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { AuditEventTypeBadge } from './AuditEventTypeBadge.jsx';
import { AuditSeverityBadge } from './AuditSeverityBadge.jsx';
import { formatAuditTimestamp } from '../../utils/auditHelpers.js';

export function CriticalAuditEventModal({ event, onClose, onViewDetail }) {
  return (
    <ModalShell title="Se registro un evento critico" description="Revise el detalle del evento para consultar la trazabilidad completa y validar el contexto administrativo." onClose={onClose} widthClass="max-w-lg">
      <div className="rounded-[12px] border border-[#DC2626]/15 bg-[#FEE2E2]/40 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <AuditEventTypeBadge operationType={event.operationType} />
          <AuditSeverityBadge severity={event.severity} />
        </div>
        <p className="mt-3 text-sm font-semibold text-[#2F3A45]">{event.summary}</p>
        <p className="mt-2 text-sm text-gray-600">{event.userName} · {formatAuditTimestamp(event.timestamp)} · {event.requestId}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cerrar</button>
        <button type="button" onClick={onViewDetail} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Ver detalle</button>
      </div>
    </ModalShell>
  );
}