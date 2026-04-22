import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

export function RubroSelector({ rubros, selectedRubroId, onSelect }) {
  const [query, setQuery] = useState('');

  const visibleRubros = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rubros.filter((rubro) => {
      if (!normalizedQuery) {
        return true;
      }

      return rubro.code.toLowerCase().includes(normalizedQuery) || rubro.description.toLowerCase().includes(normalizedQuery);
    });
  }, [query, rubros]);

  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm">
      <div>
        <label htmlFor="progress-rubro-search" className="mb-1.5 block text-sm font-medium text-[#2F3A45]">Seleccione un rubro</label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="progress-rubro-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar rubro por código o descripción"
            className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] pl-9 pr-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {visibleRubros.map((rubro) => {
          const isSelected = rubro.id === selectedRubroId;

          return (
            <button
              key={rubro.id}
              type="button"
              onClick={() => onSelect(rubro.id)}
              className={`w-full rounded-[12px] border p-4 text-left transition ${isSelected ? 'border-[#1F4E79] bg-[#DCEAF7]/50 shadow-sm' : 'border-[#D1D5DB] bg-white hover:bg-[#F7F9FC]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{rubro.code}</p>
                  <p className="mt-1 text-sm font-semibold text-[#2F3A45]">{rubro.description}</p>
                </div>
                <span className="rounded-full border border-[#D1D5DB] bg-[#F7F9FC] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#1F4E79]">
                  {rubro.unit}
                </span>
              </div>
            </button>
          );
        })}

        {!visibleRubros.length ? (
          <div className="rounded-[12px] border border-dashed border-[#D1D5DB] bg-[#F7F9FC] px-4 py-5 text-sm text-gray-500">
            No se encontraron rubros con ese criterio. Ajuste la búsqueda para continuar.
          </div>
        ) : null}
      </div>
    </section>
  );
}