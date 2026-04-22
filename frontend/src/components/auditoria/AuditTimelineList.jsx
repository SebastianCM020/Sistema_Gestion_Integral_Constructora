import React from 'react';
import { AuditEventTypeBadge } from './AuditEventTypeBadge.jsx';
import { AuditSeverityBadge } from './AuditSeverityBadge.jsx';
import { formatAuditTimestamp, formatAuditProjectLabel } from '../../utils/auditHelpers.js';

export function AuditTimelineList({ events, onOpenDetail, onFilterUser, onFilterProject }) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <article key={event.id} className="relative rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <div className="absolute bottom-0 left-[22px] top-0 hidden w-px bg-[#D1D5DB] md:block" />
          <div className="relative flex gap-4">
            <div className="hidden h-4 w-4 rounded-full border-4 border-white bg-[#1F4E79] md:block" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[#2F3A45]">{event.summary}</p>
                <AuditEventTypeBadge operationType={event.operationType} />
                <AuditSeverityBadge severity={event.severity} />
              </div>
              <p className="mt-2 text-sm text-gray-600">{event.userName} · {event.userRole} · {formatAuditTimestamp(event.timestamp)}</p>
              <p className="mt-1 text-sm text-gray-500">{formatAuditProjectLabel(event)} · {event.entityLabel}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => onOpenDetail(event.id)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-white">Abrir detalle</button>
                <button type="button" onClick={() => onFilterUser(event.userId)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#1F4E79]/20 px-3 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">Seguir usuario</button>
                <button type="button" onClick={() => onFilterProject(event.projectId)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#1F4E79]/20 px-3 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">Seguir proyecto</button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}