import React from 'react';

export function SectionHeader({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-[#2F3A45]">{title}</h2>
        {description ? <p className="text-sm text-gray-500 mt-1">{description}</p> : null}
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50 transition-colors"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}