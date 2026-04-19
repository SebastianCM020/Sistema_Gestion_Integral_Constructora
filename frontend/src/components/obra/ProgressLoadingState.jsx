import React from 'react';

export function ProgressLoadingState() {
  return (
    <section className="space-y-4 animate-pulse">
      <div className="h-32 rounded-[12px] border border-[#D1D5DB] bg-white" />
      <div className="h-32 rounded-[12px] border border-[#D1D5DB] bg-white" />
      <div className="h-64 rounded-[12px] border border-[#D1D5DB] bg-white" />
    </section>
  );
}