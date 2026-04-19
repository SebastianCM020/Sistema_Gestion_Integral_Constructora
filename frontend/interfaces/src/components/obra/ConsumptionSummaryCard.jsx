import React from 'react';
import { Boxes, FolderKanban, UploadCloud } from 'lucide-react';

export function ConsumptionSummaryCard({ summary }) {
  const items = [
    { id: 'assignedProjects', label: 'Proyectos asignados', value: summary.assignedProjects, icon: FolderKanban },
    { id: 'availableMaterials', label: 'Materiales activos', value: summary.availableMaterials, icon: Boxes },
    { id: 'pendingSync', label: 'Pendientes sync', value: summary.pendingSync, icon: UploadCloud },
  ];

  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.id} className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[#2F3A45]">{item.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-[#1F4E79]">
                  <Icon size={18} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-3 rounded-[12px] border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-gray-600">
        Consumo acumulado hoy en el proyecto activo: <span className="font-semibold text-[#2F3A45]">{summary.todayConsumption}</span>
      </div>
    </section>
  );
}