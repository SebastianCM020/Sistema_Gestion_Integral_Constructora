import React from 'react';

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-[12px] border border-dashed border-[#D1D5DB] bg-[#F7F9FC] px-5 py-6 text-center">
      <h3 className="text-sm font-semibold text-[#2F3A45] mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#1F4E79] px-4 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40 transition-colors"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}