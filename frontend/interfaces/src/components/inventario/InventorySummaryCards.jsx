import React from 'react';
import { Boxes, ClipboardCheck, History, TriangleAlert } from 'lucide-react';

export function InventorySummaryCards({ summary }) {
  const items = [
    { id: 'approvedAvailable', label: 'Recepciones disponibles', value: summary.approvedAvailable, icon: ClipboardCheck },
    { id: 'lowStock', label: 'Stock bajo', value: summary.lowStock, icon: TriangleAlert },
    { id: 'totalMaterials', label: 'Materiales en inventario', value: summary.totalMaterials, icon: Boxes },
    { id: 'lastReceptions', label: 'Recepciones registradas', value: summary.lastReceptions, icon: History },
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