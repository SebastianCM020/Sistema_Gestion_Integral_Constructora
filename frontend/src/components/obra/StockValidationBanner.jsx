import React from 'react';
import { CircleAlert, CircleCheckBig, ShieldAlert } from 'lucide-react';

const toneMap = {
  idle: {
    icon: CircleAlert,
    className: 'border-[#D1D5DB] bg-[#F7F9FC] text-[#2F3A45]',
  },
  error: {
    icon: ShieldAlert,
    className: 'border-[#DC2626]/20 bg-[#FEE2E2] text-[#991B1B]',
  },
  ok: {
    icon: CircleCheckBig,
    className: 'border-[#16A34A]/20 bg-[#DCFCE7] text-[#166534]',
  },
  warning: {
    icon: CircleAlert,
    className: 'border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]',
  },
  block: {
    icon: ShieldAlert,
    className: 'border-[#DC2626]/20 bg-[#FEE2E2] text-[#991B1B]',
  },
};

export function StockValidationBanner({ validation }) {
  const meta = toneMap[validation.status] ?? toneMap.idle;
  const Icon = meta.icon;

  return (
    <section className={`rounded-[12px] border p-4 shadow-sm ${meta.className}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/70">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold">Validación de stock</p>
          <p className="mt-1 text-sm">{validation.message}</p>
        </div>
      </div>
    </section>
  );
}