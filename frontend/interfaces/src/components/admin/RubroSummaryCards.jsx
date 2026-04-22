import React from 'react';
import { AlertTriangle, Boxes, CheckCircle2, FileSpreadsheet } from 'lucide-react';

const cards = [
  { id: 'totalRubros', label: 'Total de rubros', helper: 'Rubros visibles para el proyecto activo', icon: Boxes },
  { id: 'activeRubros', label: 'Rubros activos', helper: 'Listos para operación y seguimiento', icon: CheckCircle2 },
  { id: 'lastImportRows', label: 'Último lote importado', helper: 'Filas incorporadas en la carga más reciente', icon: FileSpreadsheet },
  { id: 'lastImportErrors', label: 'Errores del último lote', helper: 'Filas con validación pendiente o rechazada', icon: AlertTriangle },
];

export function RubroSummaryCards({ summary }) {
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