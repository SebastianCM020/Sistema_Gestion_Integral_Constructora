import React from 'react';
import { Search } from 'lucide-react';

export function MaterialsCatalogSelector({ materials, query, selectedMaterialId, onQueryChange, onSelect }) {
  return (
    <div>
      <label htmlFor="line-material-query" className="block text-sm font-medium text-[#2F3A45]">Buscar material del catálogo</label>
      <div className="mt-2 flex items-center gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3">
        <Search size={16} className="text-[#1F4E79]" />
        <input
          id="line-material-query"
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar material por código o nombre"
          className="h-[44px] w-full bg-transparent text-sm text-[#2F3A45] outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-3">
        {materials.map((material) => {
          const isSelected = selectedMaterialId === material.id;

          return (
            <button
              key={material.id}
              type="button"
              onClick={() => onSelect(material.id)}
              className={`w-full rounded-[12px] border p-3 text-left transition ${isSelected ? 'border-[#1F4E79] bg-[#DCEAF7]/40' : 'border-[#D1D5DB] bg-white hover:bg-[#F7F9FC]'}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{material.code}</p>
              <p className="mt-1 text-sm font-semibold text-[#2F3A45]">{material.name}</p>
              <p className="mt-1 text-xs text-gray-500">Unidad: {material.unit} · Categoría: {material.category}</p>
            </button>
          );
        })}

        {!materials.length ? <p className="px-1 py-3 text-sm text-gray-500">No hay materiales disponibles en el catálogo para este proyecto.</p> : null}
      </div>
    </div>
  );
}