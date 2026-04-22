import React from 'react';

export function ReportsTabsSwitcher({ tabs, activeTab, onChange }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-2 shadow-sm">
      <div className="grid gap-2 md:grid-cols-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-[10px] px-4 py-3 text-left transition-colors ${activeTab === tab.id ? 'bg-[#1F4E79] text-white' : 'bg-[#F7F9FC] text-[#2F3A45] hover:bg-[#DCEAF7]/60'}`}
          >
            <p className="text-sm font-semibold">{tab.label}</p>
            <p className={`mt-1 text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-gray-500'}`}>{tab.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}