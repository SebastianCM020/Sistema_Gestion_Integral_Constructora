import React from 'react';

export function TechnicalSettingsLoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-[12px] bg-white shadow-sm" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-[12px] bg-white shadow-sm" />)}
      </div>
      <div className="h-[420px] animate-pulse rounded-[12px] bg-white shadow-sm" />
    </div>
  );
}