import React from 'react';

export function AuditSummaryCards({ cards }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-[#111827]">{card.value}</p>
          <p className="mt-2 text-sm text-gray-600">{card.description}</p>
        </article>
      ))}
    </section>
  );
}