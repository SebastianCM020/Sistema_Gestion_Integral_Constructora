import React from 'react';

export function ReportsLoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-[12px] bg-white shadow-sm" />
      <div className="h-20 animate-pulse rounded-[12px] bg-white shadow-sm" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="h-24 animate-pulse rounded-[12px] bg-white shadow-sm" />
        <div className="h-24 animate-pulse rounded-[12px] bg-white shadow-sm" />
        <div className="h-24 animate-pulse rounded-[12px] bg-white shadow-sm" />
        <div className="h-24 animate-pulse rounded-[12px] bg-white shadow-sm" />
      </div>
      <div className="h-72 animate-pulse rounded-[12px] bg-white shadow-sm" />
    </div>
  );
}