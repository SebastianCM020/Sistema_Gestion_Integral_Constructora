import React from 'react';
import { normalizeChartSegments } from '../../utils/dashboardHelpers.js';

export function DashboardChartCard({ chart, onOpenDetail, onOpenDefinition }) {
  const segments = normalizeChartSegments(chart);

  return (
    <article className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#2F3A45]">{chart.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{chart.subtitle}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {segments.map((segment) => (
          <div key={segment.id}>
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>{segment.label}</span>
              <span>{segment.value}%</span>
            </div>
            <div className="h-3 rounded-full bg-[#F7F9FC]">
              <div className="h-3 rounded-full" style={{ width: `${segment.percentage}%`, backgroundColor: segment.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => onOpenDetail(chart)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Ver detalle</button>
        <button type="button" onClick={() => onOpenDefinition(chart)} className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-[#1F4E79]/20 px-3 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40">Definición</button>
      </div>
    </article>
  );
}