import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatReportMetricValue } from '../../utils/reportHelpers.js';
import { DashboardStatusBadge } from './DashboardStatusBadge.jsx';

export function ManagerKpiCards({ metrics, onOpenDetail, onOpenDefinition }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.key} className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <DashboardStatusBadge status={metric.status} />
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${metric.trend === 'down' ? 'bg-[#F59E0B]/15 text-[#92400E]' : 'bg-[#DCEAF7] text-[#1F4E79]'}`}>
              {metric.trend === 'down' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-[#2F3A45]">{metric.label}</p>
          <p className="mt-2 text-3xl font-semibold text-[#111827]">{formatReportMetricValue(metric)}</p>
          <p className="mt-2 text-sm text-gray-600">{metric.contextNote}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onOpenDetail(metric)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Abrir detalle</button>
            <button type="button" onClick={() => onOpenDefinition(metric)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#1F4E79]/20 px-3 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">Definición</button>
          </div>
        </article>
      ))}
    </section>
  );
}