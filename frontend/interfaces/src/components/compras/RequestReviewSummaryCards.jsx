import React from 'react';
import { AlertTriangle, CircleCheckBig, ClipboardClock, CircleSlash2 } from 'lucide-react';

export function RequestReviewSummaryCards({ summary }) {
  const items = [
    { id: 'pending', label: 'Pendientes', value: summary.pending, icon: ClipboardClock },
    { id: 'critical', label: 'Críticos', value: summary.critical, icon: AlertTriangle },
    { id: 'approved', label: 'Aprobados recientes', value: summary.approved, icon: CircleCheckBig },
    { id: 'rejected', label: 'Rechazados recientes', value: summary.rejected, icon: CircleSlash2 },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article key={item.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#2F3A45]">{item.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F7F9FC] text-[#1F4E79]">
                <Icon size={18} />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}