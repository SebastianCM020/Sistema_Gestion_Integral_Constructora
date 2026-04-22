import React from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Files } from 'lucide-react';

export function BillingSummaryCards({ summary }) {
  const cards = [
    { id: 'total', label: 'Documentos disponibles', value: summary.total, icon: Files },
    { id: 'generated', label: 'Documentos generados', value: summary.generated, icon: CheckCircle2 },
    { id: 'process', label: 'Documentos en proceso', value: summary.inProcess, icon: Clock3 },
    { id: 'errors', label: 'Errores recientes', value: summary.errors, icon: AlertTriangle },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#2F3A45]">{card.value}</p>
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