import React from 'react';
import { CalendarRange } from 'lucide-react';
import { formatShortDate, getDateRangeSummary } from '../../utils/projectAccessHelpers.js';

export function DateRangeSummary({ assignment, compact = false }) {
  return (
    <div className={`rounded-[12px] border border-[#D1D5DB] ${compact ? 'bg-[#F7F9FC] p-3' : 'bg-white p-4'}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#DCEAF7] text-[#1F4E79]">
          <CalendarRange size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2F3A45]">Vigencia configurada</p>
          <p className="mt-1 text-sm text-gray-600">{getDateRangeSummary(assignment)}</p>
          <p className="mt-2 text-xs font-medium text-gray-500">
            Inicio: {formatShortDate(assignment.startDate)} • Fin: {formatShortDate(assignment.endDate)}
          </p>
        </div>
      </div>
    </div>
  );
}