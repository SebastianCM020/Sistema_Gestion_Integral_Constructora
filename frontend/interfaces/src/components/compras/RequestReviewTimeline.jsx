import React from 'react';
import { CheckCircle2, Clock3, FileWarning, SendHorizontal } from 'lucide-react';
import { formatReviewDate } from '../../utils/requestReviewHelpers.js';

const iconMap = {
  created: Clock3,
  submitted: SendHorizontal,
  approved: CheckCircle2,
  rejected: FileWarning,
};

export function RequestReviewTimeline({ timeline }) {
  return (
    <div className="space-y-4">
      {timeline.map((event) => {
        const Icon = iconMap[event.type] ?? Clock3;

        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F9FC] text-[#1F4E79]">
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1 rounded-[12px] border border-[#D1D5DB] bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#2F3A45]">{event.title}</p>
                <span className="text-xs text-gray-500">{formatReviewDate(event.timestamp)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{event.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}