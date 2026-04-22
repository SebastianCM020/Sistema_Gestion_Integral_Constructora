import React from 'react';

export function PermissionBadge({ label }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-[#F7F9FC] px-3 py-1 text-xs font-medium text-[#2F3A45]">
      {label}
    </span>
  );
}