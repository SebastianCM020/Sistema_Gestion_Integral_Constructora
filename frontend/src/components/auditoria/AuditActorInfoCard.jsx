import React from 'react';

export function AuditActorInfoCard({ event, comparison }) {
  return (
    <article className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#2F3A45]">Actor del evento</h3>
      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <p><span className="font-semibold text-[#2F3A45]">Nombre:</span> {event.userName}</p>
        <p><span className="font-semibold text-[#2F3A45]">Rol:</span> {event.userRole}</p>
        <p><span className="font-semibold text-[#2F3A45]">Correo:</span> {comparison?.actor?.email ?? event.userEmail ?? 'No disponible'}</p>
        <p><span className="font-semibold text-[#2F3A45]">Sesion:</span> {comparison?.actor?.sessionLabel ?? 'Sesion valida registrada'}</p>
      </div>
    </article>
  );
}