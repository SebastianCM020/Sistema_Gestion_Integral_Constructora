import React, { useMemo, useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { MaterialsCatalogSelector } from './MaterialsCatalogSelector.jsx';
import { defaultRequestLineValues, filterCatalogMaterials, validateRequestLine } from '../../utils/purchaseRequestHelpers.js';

export function RequestLineFormModal({ materials, initialLine, onCancel, onSave }) {
  const [values, setValues] = useState({
    materialId: initialLine?.materialId ?? defaultRequestLineValues.materialId,
    quantity: initialLine?.requestedQuantity ? String(initialLine.requestedQuantity) : defaultRequestLineValues.quantity,
  });
  const [query, setQuery] = useState('');
  const [errors, setErrors] = useState({});

  const visibleMaterials = useMemo(() => filterCatalogMaterials(materials, query), [materials, query]);
  const selectedMaterial = materials.find((material) => material.id === values.materialId) ?? null;

  const handleSubmit = () => {
    const validationErrors = validateRequestLine(values);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    if (!selectedMaterial) {
      setErrors({ materialId: 'Seleccione un material válido del catálogo.' });
      return;
    }

    onSave(selectedMaterial, Number(values.quantity));
  };

  return (
    <ModalShell
      title={initialLine ? 'Editar material del requerimiento' : 'Agregar material al requerimiento'}
      description="Seleccione el material del catálogo e ingrese la cantidad solicitada."
      onClose={onCancel}
      widthClass="max-w-3xl"
    >
      <div className="space-y-5">
        <MaterialsCatalogSelector
          materials={visibleMaterials}
          query={query}
          selectedMaterialId={values.materialId}
          onQueryChange={setQuery}
          onSelect={(materialId) => {
            setValues((currentValues) => ({ ...currentValues, materialId }));
            setErrors((currentErrors) => ({ ...currentErrors, materialId: undefined }));
          }}
        />
        {errors.materialId ? <p className="text-sm text-[#DC2626]">{errors.materialId}</p> : null}

        <div>
          <label htmlFor="line-quantity" className="block text-sm font-medium text-[#2F3A45]">Cantidad solicitada</label>
          <div className="mt-2 flex items-center overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC]">
            <input
              id="line-quantity"
              type="number"
              min="0"
              step="0.01"
              value={values.quantity}
              onChange={(event) => {
                setValues((currentValues) => ({ ...currentValues, quantity: event.target.value }));
                setErrors((currentErrors) => ({ ...currentErrors, quantity: undefined }));
              }}
              className="h-[48px] w-full bg-transparent px-4 text-sm text-[#2F3A45] outline-none placeholder:text-gray-400"
              placeholder="Ingrese la cantidad"
            />
            <span className="px-4 text-sm font-semibold text-[#2F3A45]">{selectedMaterial?.unit ?? 'Unidad'}</span>
          </div>
          {errors.quantity ? <p className="mt-2 text-sm text-[#DC2626]">{errors.quantity}</p> : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">Cancelar</button>
          <button type="button" onClick={handleSubmit} className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Guardar línea</button>
        </div>
      </div>
    </ModalShell>
  );
}