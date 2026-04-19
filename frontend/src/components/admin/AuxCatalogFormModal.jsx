import React from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { FormFieldErrorMessage } from '../system/FormFieldErrorMessage.jsx';

export function AuxCatalogFormModal({ catalog, values, errors, mode, onChange, onClose, onSave }) {
  return (
    <ModalShell title={mode === 'edit' ? 'Editar registro del catálogo' : 'Guardar registro del catálogo'} description="Complete los datos del elemento auxiliar y confirme el estado del registro." onClose={onClose} widthClass="max-w-2xl">
      <div className="grid gap-4 md:grid-cols-2">
        {catalog.supportsCode ? (
          <div>
            <label htmlFor="catalog-item-code" className="block text-sm font-medium text-[#2F3A45]">Código</label>
            <input id="catalog-item-code" type="text" value={values.itemCode} onChange={(event) => onChange('itemCode', event.target.value.toUpperCase())} className={`mt-2 h-[44px] w-full rounded-[12px] border px-3 text-sm outline-none ${errors.itemCode ? 'border-[#DC2626]' : 'border-[#D1D5DB] bg-[#F7F9FC]'}`} />
            <FormFieldErrorMessage fieldId="catalog-item-code" message={errors.itemCode} />
          </div>
        ) : null}
        <div>
          <label htmlFor="catalog-item-label" className="block text-sm font-medium text-[#2F3A45]">Nombre o etiqueta</label>
          <input id="catalog-item-label" type="text" value={values.itemLabel} onChange={(event) => onChange('itemLabel', event.target.value)} className={`mt-2 h-[44px] w-full rounded-[12px] border px-3 text-sm outline-none ${errors.itemLabel ? 'border-[#DC2626]' : 'border-[#D1D5DB] bg-[#F7F9FC]'}`} />
          <FormFieldErrorMessage fieldId="catalog-item-label" message={errors.itemLabel} />
        </div>
        {catalog.supportsSortOrder ? (
          <div>
            <label htmlFor="catalog-item-order" className="block text-sm font-medium text-[#2F3A45]">Orden visible</label>
            <input id="catalog-item-order" type="number" value={values.sortOrder} onChange={(event) => onChange('sortOrder', event.target.value)} className={`mt-2 h-[44px] w-full rounded-[12px] border px-3 text-sm outline-none ${errors.sortOrder ? 'border-[#DC2626]' : 'border-[#D1D5DB] bg-[#F7F9FC]'}`} />
            <FormFieldErrorMessage fieldId="catalog-item-order" message={errors.sortOrder} />
          </div>
        ) : null}
        <div>
          <label className="block text-sm font-medium text-[#2F3A45]">Estado del registro</label>
          <button type="button" onClick={() => onChange('isActive', !values.isActive)} className={`mt-2 inline-flex h-[44px] items-center justify-center rounded-[12px] border px-4 text-sm font-medium ${values.isActive ? 'border-[#16A34A]/20 bg-[#16A34A]/10 text-[#166534]' : 'border-[#D1D5DB] bg-[#F7F9FC] text-[#2F3A45]'}`}>{values.isActive ? 'Activo' : 'Inactivo'}</button>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Cancelar</button>
        <button type="button" onClick={onSave} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Guardar registro</button>
      </div>
    </ModalShell>
  );
}