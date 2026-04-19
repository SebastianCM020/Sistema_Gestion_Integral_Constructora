import React from 'react';
import { Search } from 'lucide-react';
import { SettingsSectionCard } from './SettingsSectionCard.jsx';
import { AuxCatalogTable } from './AuxCatalogTable.jsx';
import { EmptySettingsState } from './EmptySettingsState.jsx';
import { SettingsStatusBadge } from './SettingsStatusBadge.jsx';

export function AuxiliaryCatalogsPanel({ catalogs, selectedCatalogId, searchTerm, onSelectCatalog, onSearch, visibleItems, onCreateItem, onEditItem, onOpenDetail }) {
  const activeCatalog = catalogs.find((catalog) => catalog.catalogId === selectedCatalogId) ?? catalogs[0] ?? null;

  if (!activeCatalog) {
    return <EmptySettingsState title="No hay catálogos auxiliares disponibles" description="Agregue un catálogo o espere la carga de configuración administrativa para continuar." />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SettingsSectionCard title="Catálogos disponibles" description="Seleccione un catálogo para revisar sus registros, vigencia y trazabilidad."
        actionSlot={<button type="button" onClick={onCreateItem} className="inline-flex h-[40px] items-center justify-center rounded-[10px] bg-[#1F4E79] px-3 text-sm font-medium text-white hover:bg-[#153a5c]">Nuevo registro</button>}>
        <div className="space-y-3">
          {catalogs.map((catalog) => {
            const isActive = catalog.catalogId === activeCatalog.catalogId;
            return (
              <button key={catalog.catalogId} type="button" onClick={() => onSelectCatalog(catalog.catalogId)} className={`w-full rounded-[12px] border p-4 text-left transition ${isActive ? 'border-[#1F4E79] bg-[#DCEAF7]/60' : 'border-[#D1D5DB] bg-[#F7F9FC] hover:bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#2F3A45]">{catalog.catalogName}</p>
                    <p className="mt-1 text-sm text-gray-500">{catalog.description}</p>
                  </div>
                  <SettingsStatusBadge tone={catalog.items.length ? 'info' : 'warning'} label={`${catalog.items.length} registros`} />
                </div>
              </button>
            );
          })}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title={activeCatalog.catalogName} description={activeCatalog.description}>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <SettingsStatusBadge tone="info" label={activeCatalog.isEditable ? 'Editable' : 'Solo lectura'} />
            <span className="text-sm text-gray-500">Actualizado por {activeCatalog.updatedBy}</span>
          </div>
          <div className="relative lg:w-[280px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar por código o etiqueta" className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] pl-9 pr-3 text-sm outline-none" />
          </div>
        </div>

        {!visibleItems.length ? (
          <EmptySettingsState
            title="No hay elementos registrados en este catálogo"
            description="Agregue el primer registro auxiliar o ajuste el filtro de búsqueda para continuar administrando este catálogo."
            actionLabel="Crear primer registro"
            onAction={onCreateItem}
          />
        ) : (
          <AuxCatalogTable items={visibleItems} onEdit={onEditItem} onOpenDetail={onOpenDetail} />
        )}
      </SettingsSectionCard>
    </div>
  );
}