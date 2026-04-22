import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { defaultMaterialFormValues, materialUnitOptions, validateMaterialForm } from '../../utils/materialHelpers.js';

export function MaterialFormModal({ material, materials, onCancel, onSave }) {
  const isEditMode = Boolean(material);
  const [values, setValues] = useState(
    material
      ? {
          code: material.code,
          name: material.name,
          unit: material.unit,
          isActive: material.isActive,
          observations: material.observations ?? '',
        }
      : defaultMaterialFormValues
  );
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setValues((previousValues) => ({ ...previousValues, [field]: value }));
    setErrors((previousErrors) => ({ ...previousErrors, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateMaterialForm(values, materials, material?.id ?? null);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    onSave(values);
  };

  return (
    <ModalShell
      title={isEditMode ? 'Editar material' : 'Nuevo material'}
      description="Complete los datos del material como si luego fueran enviados a un endpoint real de administración del catálogo."
      onClose={onCancel}
      widthClass="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="material-code" label="Código" value={values.code} error={errors.code} onChange={(value) => handleChange('code', value)} placeholder="MAT-CEM-001" />
          <Field id="material-name" label="Nombre" value={values.name} error={errors.name} onChange={(value) => handleChange('name', value)} placeholder="Nombre del material" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField id="material-unit" label="Unidad" value={values.unit} error={errors.unit} onChange={(value) => handleChange('unit', value)} options={materialUnitOptions.map((unit) => ({ value: unit, label: unit }))} />
          <SelectField id="material-status" label="Estado" value={String(values.isActive)} onChange={(value) => handleChange('isActive', value === 'true')} options={[{ value: 'true', label: 'Vigente' }, { value: 'false', label: 'Inactivo' }]} />
        </div>

        <TextAreaField id="material-observations" label="Observaciones" value={values.observations} onChange={(value) => handleChange('observations', value)} placeholder="Observaciones operativas o de uso del material" />

        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-gray-600">
          La validación evita códigos o nombres duplicados y mantiene el catálogo listo para integrarse con servicios reales sin rehacer la interfaz.
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">Cancelar</button>
          <button type="submit" className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">{isEditMode ? 'Guardar cambios' : 'Crear material'}</button>
        </div>
      </form>
    </ModalShell>
  );
}

function Field({ id, label, value, error, onChange, placeholder = '' }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#2F3A45]">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[44px] w-full rounded-[12px] border px-3 text-sm focus:outline-none focus:ring-1 ${error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'}`}
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p> : null}
    </div>
  );
}

function TextAreaField({ id, label, value, onChange, placeholder = '' }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#2F3A45]">{label}</label>
      <textarea
        id={id}
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[12px] border border-[#D1D5DB] px-3 py-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
      />
    </div>
  );
}

function SelectField({ id, label, value, error, onChange, options }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#2F3A45]">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[44px] w-full rounded-[12px] border px-3 text-sm focus:outline-none focus:ring-1 ${error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'}`}
      >
        <option value="">Seleccione</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p> : null}
    </div>
  );
}