import React from 'react';

export function PurchaseRequestLoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-[12px] bg-white shadow-sm" />
      <div className="h-56 animate-pulse rounded-[12px] bg-white shadow-sm" />
      <div className="h-64 animate-pulse rounded-[12px] bg-white shadow-sm" />
    </div>
  );
}