import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

// Acepta tanto `insight.tone` como `insight.type` para compatibilidad
const resolveTone = (insight) => insight.tone ?? insight.type ?? 'info';

const TONE_CONFIG = {
  success: {
    border: 'border-emerald-200',
    bg:     'bg-emerald-50',
    icon:   CheckCircle2,
    color:  'text-emerald-600',
    title:  'text-emerald-800',
    body:   'text-emerald-700',
  },
  warning: {
    border: 'border-amber-200',
    bg:     'bg-amber-50',
    icon:   AlertTriangle,
    color:  'text-amber-600',
    title:  'text-amber-800',
    body:   'text-amber-700',
  },
  danger: {
    border: 'border-red-200',
    bg:     'bg-red-50',
    icon:   XCircle,
    color:  'text-red-600',
    title:  'text-red-800',
    body:   'text-red-700',
  },
  info: {
    border: 'border-blue-200',
    bg:     'bg-blue-50',
    icon:   Info,
    color:  'text-blue-600',
    title:  'text-blue-800',
    body:   'text-blue-700',
  },
};

export function ReportInsightCard({ insight }) {
  const tone   = resolveTone(insight);
  const config = TONE_CONFIG[tone] ?? TONE_CONFIG.info;
  const Icon   = config.icon;

  return (
    <article className={`flex gap-3 rounded-[12px] border p-4 shadow-sm ${config.border} ${config.bg}`}>
      <Icon size={17} className={`mt-0.5 shrink-0 ${config.color}`} />
      <div>
        <h3 className={`text-sm font-semibold ${config.title}`}>{insight.title}</h3>
        <p className={`mt-1.5 text-xs leading-relaxed ${config.body}`}>{insight.description}</p>
      </div>
    </article>
  );
}