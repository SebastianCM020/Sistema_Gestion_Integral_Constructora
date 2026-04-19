import React from 'react';

export function AuditRequestInfoCard({ event, comparison }) {
  return (
    <article className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#2F3A45]">Contexto de la solicitud</h3>
      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <p><span className="font-semibold text-[#2F3A45]">request_id:</span> {comparison?.request?.requestId ?? event.requestId ?? 'Sin request_id'}</p>
        <p><span className="font-semibold text-[#2F3A45]">Metodo:</span> {comparison?.request?.method ?? 'No disponible'}</p>
        <p><span className="font-semibold text-[#2F3A45]">Endpoint:</span> {comparison?.request?.endpoint ?? 'No disponible'}</p>
        <p><span className="font-semibold text-[#2F3A45]">Origen:</span> {comparison?.request?.originLabel ?? event.origin}</p>
        <p><span className="font-semibold text-[#2F3A45]">IP:</span> {event.ipAddress ?? 'No disponible'}</p>
      </div>
    </article>
  );
}