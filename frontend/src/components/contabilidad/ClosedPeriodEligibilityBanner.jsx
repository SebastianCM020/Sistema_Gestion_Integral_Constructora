import React from 'react';
import { AlertTriangle, CircleCheckBig } from 'lucide-react';

const toneClasses = {
  success: 'border-[#16A34A]/20 bg-white',
  danger: 'border-[#DC2626]/15 bg-white',
  neutral: 'border-[#D1D5DB] bg-white',
};

export function ClosedPeriodEligibilityBanner({ eligibility }) {
  const hasSuccess = eligibility.tone === 'success';
  const Icon = hasSuccess ? CircleCheckBig : AlertTriangle;
  const iconClass = hasSuccess ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#DC2626]/10 text-[#DC2626]';

  return (
    <section className={`rounded-[12px] border p-4 shadow-sm ${toneClasses[eligibility.tone] ?? toneClasses.neutral}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${iconClass}`}>
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#2F3A45]">{eligibility.label}</h2>
          <p className="mt-1 text-sm text-gray-600">{eligibility.description}</p>
        </div>
      </div>
    </section>
  );
}