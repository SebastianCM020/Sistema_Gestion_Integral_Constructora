import React from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

const toneMeta = {
  error: {
    container: 'border-[#DC2626]/20 bg-[#FEE2E2]/60 text-[#991B1B]',
    icon: AlertTriangle,
  },
  warning: {
    container: 'border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]',
    icon: ShieldAlert,
  },
  info: {
    container: 'border-[#1F4E79]/20 bg-[#DCEAF7] text-[#1F4E79]',
    icon: Info,
  },
  success: {
    container: 'border-[#16A34A]/20 bg-[#16A34A]/10 text-[#166534]',
    icon: CheckCircle2,
  },
};

export function SystemAlertBanner({ tone = 'info', title, description, icon: CustomIcon, actionLabel, onAction, children }) {
  const meta = toneMeta[tone] ?? toneMeta.info;
  const Icon = CustomIcon ?? meta.icon;

  return (
    <section className={`rounded-[12px] border p-4 shadow-sm ${meta.container}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5"><Icon size={20} /></div>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            {description ? <p className="mt-1 text-sm opacity-90">{description}</p> : null}
            {children ? <div className="mt-3">{children}</div> : null}
          </div>
        </div>
        {actionLabel && onAction ? <button type="button" onClick={onAction} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-current px-3 text-sm font-medium">{actionLabel}</button> : null}
      </div>
    </section>
  );
}