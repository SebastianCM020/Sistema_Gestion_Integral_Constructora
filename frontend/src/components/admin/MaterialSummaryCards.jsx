import React from 'react';
import { Boxes, CircleCheckBig, LayoutList, PauseCircle } from 'lucide-react';

const cards = [
  { id: 'total', label: 'Total de materiales', helper: 'Referencias disponibles en el catálogo base', icon: Boxes },
  { id: 'active', label: 'Materiales vigentes', helper: 'Listos para uso operativo y consulta rápida', icon: CircleCheckBig },
  { id: 'inactive', label: 'Materiales inactivos', helper: 'No visibles como vigentes dentro del catálogo', icon: PauseCircle },
  { id: 'unitDiversity', label: 'Unidades activas', helper: 'Diversidad de unidades configuradas en catálogo', icon: LayoutList },
];

export function MaterialSummaryCards({ summary }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-[#2F3A45]">{summary[card.id]}</p>
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