import React from 'react';
import { DrawerPanel } from '../ui/DrawerPanel.jsx';
import { AuditActorInfoCard } from './AuditActorInfoCard.jsx';
import { AuditEntityReferenceCard } from './AuditEntityReferenceCard.jsx';
import { AuditRequestInfoCard } from './AuditRequestInfoCard.jsx';
import { AuditFieldChangesTable } from './AuditFieldChangesTable.jsx';
import { AuditEventTypeBadge } from './AuditEventTypeBadge.jsx';
import { AuditSeverityBadge } from './AuditSeverityBadge.jsx';
import { formatAuditTimestamp } from '../../utils/auditHelpers.js';

export function AuditEventDetailDrawer({ event, comparison, onClose, onFilterUser, onFilterProject }) {
  return (
    <DrawerPanel title="Detalle del evento de auditoria" description="Revise actor, entidad, request_id y comparacion de cambios sin salir del contexto activo." onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <AuditEventTypeBadge operationType={event.operationType} />
            <AuditSeverityBadge severity={event.severity} />
          </div>
          <p className="mt-3 text-sm font-semibold text-[#2F3A45]">{event.summary}</p>
          <p className="mt-2 text-sm text-gray-600">Evento <span className="font-semibold">{event.id}</span> · {formatAuditTimestamp(event.timestamp)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onFilterUser(event.userId)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#1F4E79]/20 px-3 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">Filtrar este usuario</button>
            <button type="button" onClick={() => onFilterProject(event.projectId)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#1F4E79]/20 px-3 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">Filtrar este proyecto</button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <AuditActorInfoCard event={event} comparison={comparison} />
          <AuditEntityReferenceCard event={event} comparison={comparison} />
          <AuditRequestInfoCard event={event} comparison={comparison} />
        </div>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[#2F3A45]">Comparacion de cambios</h3>
          <AuditFieldChangesTable fieldChanges={comparison?.fieldChanges ?? []} />
        </section>
      </div>
    </DrawerPanel>
  );
}