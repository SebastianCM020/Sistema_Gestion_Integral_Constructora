import React from 'react';

export function ProjectsTableSkeleton() {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm animate-pulse">
      <div className="mb-5 h-6 w-64 rounded bg-gray-200" />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC]" />
        ))}
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-11 rounded-[12px] bg-gray-100" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-16 rounded-[12px] bg-gray-100" />
        ))}
      </div>
    </section>
  );
}