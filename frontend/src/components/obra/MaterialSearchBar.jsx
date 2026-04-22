import React from 'react';
import { Search } from 'lucide-react';

export function MaterialSearchBar({ value, onChange }) {
  return (
    <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
      <label className="block text-sm font-semibold text-[#2F3A45]" htmlFor="material-search">Busque o seleccione un material</label>
      <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3">
        <Search size={16} className="text-[#1F4E79]" />
        <input
          id="material-search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar material por código o nombre"
          className="h-[44px] w-full bg-transparent text-sm text-[#2F3A45] outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}