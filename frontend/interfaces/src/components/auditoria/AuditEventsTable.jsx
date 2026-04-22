import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AuditEventTypeBadge } from './AuditEventTypeBadge.jsx';
import { AuditSeverityBadge } from './AuditSeverityBadge.jsx';
import { formatAuditModuleLabel, formatAuditProjectLabel, formatAuditReference, formatAuditTimestamp } from '../../utils/auditHelpers.js';

export function AuditEventsTable({ events, onOpenDetail }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm">
      <div className="hidden grid-cols-[170px_1.2fr_1fr_120px_110px_130px] gap-4 border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 xl:grid">
        <span>Fecha y hora</span>
        <span>Actor y resumen</span>
        <span>Proyecto o entidad</span>
        <span>Operacion</span>
        <span>Severidad</span>
        <span></span>
      </div>
      <div className="divide-y divide-[#D1D5DB]">
        {events.map((event) => (
          <div key={event.id} className="grid gap-4 px-4 py-4 xl:grid-cols-[170px_1.2fr_1fr_120px_110px_130px] xl:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 xl:hidden">Fecha y hora</p>
              <p className="text-sm font-medium text-[#2F3A45]">{formatAuditTimestamp(event.timestamp)}</p>
              <p className="mt-1 text-xs text-gray-500">{formatAuditReference(event)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 xl:hidden">Actor y resumen</p>
              <p className="text-sm font-semibold text-[#2F3A45]">{event.userName} · {event.userRole}</p>
              <p className="mt-1 text-sm text-gray-600">{event.summary}</p>
              <p className="mt-2 text-xs text-gray-500">Modulo: {formatAuditModuleLabel(event.module)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 xl:hidden">Proyecto o entidad</p>
              <p className="text-sm font-medium text-[#2F3A45]">{formatAuditProjectLabel(event)}</p>
              <p className="mt-1 text-sm text-gray-600">{event.entityLabel}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 xl:hidden">Operacion</p>
              <AuditEventTypeBadge operationType={event.operationType} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 xl:hidden">Severidad</p>
              <AuditSeverityBadge severity={event.severity} />
            </div>
            <div className="flex justify-start xl:justify-end">
              <button type="button" onClick={() => onOpenDetail(event.id)} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">
                Ver detalle
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}