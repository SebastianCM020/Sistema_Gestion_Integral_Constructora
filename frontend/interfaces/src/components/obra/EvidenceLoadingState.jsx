import React from 'react';

export function EvidenceLoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-[12px] bg-white shadow-sm" />
      <div className="h-44 animate-pulse rounded-[12px] bg-white shadow-sm" />
      <div className="h-36 animate-pulse rounded-[12px] bg-white shadow-sm" />
    </div>
  );
}