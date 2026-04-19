import React from 'react';
import { AlertTriangle, CircleCheckBig, ShieldAlert } from 'lucide-react';

const toneMap = {
  ok: {
    icon: CircleCheckBig,
    className: 'border-[#16A34A]/15 bg-[#16A34A]/10 text-[#166534]',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#9A6700]',
  },
  block: {
    icon: ShieldAlert,
    className: 'border-[#DC2626]/15 bg-[#DC2626]/10 text-[#B91C1C]',
  },
  error: {
    icon: ShieldAlert,
    className: 'border-[#DC2626]/15 bg-[#DC2626]/10 text-[#B91C1C]',
  },
  idle: {
    icon: AlertTriangle,
    className: 'border-[#D1D5DB] bg-white text-[#2F3A45]',
  },
};

export function BudgetValidationBanner({ validation }) {
  const tone = toneMap[validation.status] ?? toneMap.idle;
  const Icon = tone.icon;

  return (
    <div className={`rounded-[12px] border px-4 py-3 text-sm ${tone.className}`}>
      <div className="flex items-start gap-2">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Validación presupuestaria</p>
          <p className="mt-1">{validation.message}</p>
        </div>
      </div>
    </div>
  );
}