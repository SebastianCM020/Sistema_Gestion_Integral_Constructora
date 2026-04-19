import React from 'react';
import { ArrowRight, CircleAlert, CircleCheckBig, TriangleAlert } from 'lucide-react';
import { EmptyState } from './EmptyState.jsx';

const toneStyles = {
  info: {
    wrapper: 'border-[#D1D5DB] bg-white',
    icon: CircleAlert,
    iconClass: 'text-[#1F4E79] bg-[#DCEAF7]',
  },
  warning: {
    wrapper: 'border-[#F59E0B]/20 bg-[#FFF9EB]',
    icon: TriangleAlert,
    iconClass: 'text-[#B45309] bg-[#F59E0B]/10',
  },
  error: {
    wrapper: 'border-[#DC2626]/15 bg-[#FEF2F2]',
    icon: TriangleAlert,
    iconClass: 'text-[#DC2626] bg-[#DC2626]/10',
  },
  success: {
    wrapper: 'border-[#16A34A]/15 bg-[#F0FDF4]',
    icon: CircleCheckBig,
    iconClass: 'text-[#16A34A] bg-[#16A34A]/10',
  },
};

export function AlertList({ items, onOpenItem, onBackToDashboard }) {
  if (!items.length) {
    return (
      <EmptyState
        title="No tiene pendientes en este momento"
        description="Su panel está al día. Puede volver al panel principal o abrir un módulo para continuar con su operación."
        actionLabel="Mantenerme en el panel"
        onAction={onBackToDashboard}
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const tone = toneStyles[item.tone] ?? toneStyles.info;
        const Icon = tone.icon;

        return (
          <article key={item.id} className={`rounded-[12px] border p-4 ${tone.wrapper}`}>
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${tone.iconClass}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#2F3A45]">{item.title}</p>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                <button
                  type="button"
                  onClick={() => onOpenItem(item.moduleId)}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#1F4E79] hover:underline"
                >
                  {item.actionLabel}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}