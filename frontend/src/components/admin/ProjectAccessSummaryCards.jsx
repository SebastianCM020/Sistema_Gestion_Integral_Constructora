import React from 'react';
import { CalendarClock, Eye, KeyRound, ShieldAlert } from 'lucide-react';

const summaryCards = [
  { id: 'total', label: 'Total de asignaciones', helper: 'Registros visibles para control operativo', icon: KeyRound },
  { id: 'active', label: 'Asignaciones activas', helper: 'Con acceso operativo vigente', icon: CalendarClock },
  { id: 'expired', label: 'Asignaciones expiradas', helper: 'Requieren revisión o renovación', icon: ShieldAlert },
  { id: 'revoked', label: 'Revocadas o solo lectura', helper: 'Controladas para trazabilidad y consulta', icon: Eye },
];

export function ProjectAccessSummaryCards({ summary }) {
  const values = {
    total: summary.total,
    active: summary.active,
    expired: summary.expired,
    revoked: summary.revoked + summary.readonly,
  };

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-[#2F3A45]">{values[card.id]}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]">
                <Icon size={20} />
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">{card.helper}</p>
          </article>
        );
      })}
    </section>
  );
}