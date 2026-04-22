import React from 'react';

export function UserTableSkeleton() {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm animate-pulse">
      <div className="h-6 w-56 rounded bg-gray-100" />
      <div className="mt-5 space-y-4">
        {[1, 2, 3, 4].map((row) => (
          <div key={row} className="grid gap-4 lg:grid-cols-[1.4fr_1fr_0.8fr_1fr_1.3fr_0.9fr]">
            <div className="h-16 rounded bg-gray-100" />
            <div className="h-16 rounded bg-gray-100" />
            <div className="h-16 rounded bg-gray-100" />
            <div className="h-16 rounded bg-gray-100" />
            <div className="h-16 rounded bg-gray-100" />
            <div className="h-16 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}