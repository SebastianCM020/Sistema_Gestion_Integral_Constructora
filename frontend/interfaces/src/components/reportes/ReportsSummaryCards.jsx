import React from 'react';
import { formatReportMetricValue } from '../../utils/reportHelpers.js';
import { DashboardStatusBadge } from './DashboardStatusBadge.jsx';

export function ReportsSummaryCards({ metrics, onOpenDetail, onOpenDefinition }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.key} className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[#2F3A45]">{formatReportMetricValue(metric)}</p>
            </div>
            <DashboardStatusBadge status={metric.status} />
          </div>
          <p className="mt-3 text-sm text-gray-600">{metric.contextNote}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onOpenDetail(metric)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Ver detalle</button>
            <button type="button" onClick={() => onOpenDefinition(metric)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#1F4E79]/20 px-3 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">Definición</button>
          </div>
        </article>
      ))}
    </section>
  );
}