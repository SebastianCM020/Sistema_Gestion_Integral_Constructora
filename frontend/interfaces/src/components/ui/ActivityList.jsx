import React from 'react';
import { ArrowRight, Clock3 } from 'lucide-react';
import { EmptyState } from './EmptyState.jsx';

export function ActivityList({ items, onOpenItem, onBackToDashboard }) {
  if (!items.length) {
    return (
      <EmptyState
        title="Aún no hay actividad reciente"
        description="Cuando registre acciones en sus módulos autorizados, aquí verá los eventos más relevantes para retomar contexto rápidamente."
        actionLabel="Volver al panel principal"
        onAction={onBackToDashboard}
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F7F9FC] text-[#1F4E79] border border-[#D1D5DB]">
              <Clock3 size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-[#2F3A45]">{item.title}</p>
                <span className="text-xs text-gray-400">{item.timeLabel}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              {item.moduleId ? (
                <button
                  type="button"
                  onClick={() => onOpenItem(item.moduleId)}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#1F4E79] hover:underline"
                >
                  Ver contexto
                  <ArrowRight size={16} />
                </button>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}