import React from 'react';
import { formatAuditProjectLabel } from '../../utils/auditHelpers.js';

export function AuditEntityReferenceCard({ event, comparison }) {
  return (
    <article className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#2F3A45]">Entidad afectada</h3>
      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <p><span className="font-semibold text-[#2F3A45]">Entidad:</span> {comparison?.entity?.title ?? event.entityLabel}</p>
        <p><span className="font-semibold text-[#2F3A45]">Detalle:</span> {comparison?.entity?.subtitle ?? event.entityType}</p>
        <p><span className="font-semibold text-[#2F3A45]">Referencia:</span> {comparison?.entity?.entityReference ?? event.entityId}</p>
        <p><span className="font-semibold text-[#2F3A45]">Proyecto:</span> {comparison?.entity?.projectReference ?? formatAuditProjectLabel(event)}</p>
      </div>
    </article>
  );
}