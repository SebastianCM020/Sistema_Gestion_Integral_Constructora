import React from 'react';

export function TechnicalSettingsTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-[12px] border p-4 text-left transition ${isActive ? 'border-[#1F4E79] bg-[#DCEAF7]/60 shadow-sm' : 'border-[#D1D5DB] bg-white hover:border-[#1F4E79]/30 hover:bg-[#F7F9FC]'}`}
          >
            <p className="text-sm font-semibold text-[#2F3A45]">{tab.label}</p>
            <p className="mt-1 text-sm text-gray-500">{tab.helper}</p>
          </button>
        );
      })}
    </div>
  );
}