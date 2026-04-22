import React from 'react';

export function InventoryReceptionLoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-[12px] bg-white shadow-sm" />
      <div className="h-20 animate-pulse rounded-[12px] bg-white shadow-sm" />
      <div className="h-72 animate-pulse rounded-[12px] bg-white shadow-sm" />
    </div>
  );
}