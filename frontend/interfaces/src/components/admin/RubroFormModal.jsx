import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { defaultRubroFormValues, getRubroContextLabel, validateRubroForm } from '../../utils/rubroHelpers.js';

export function RubroFormModal({ rubro, rubros, currentProject, onCancel, onSave }) {
  const isEditMode = Boolean(rubro);
  const [values, setValues] = useState(
    rubro
      ? {
          code: rubro.code,
          description: rubro.description,
          unit: rubro.unit,
          unitPrice: String(rubro.unitPrice),
          budgetedQuantity: String(rubro.budgetedQuantity),
          isActive: rubro.isActive,
        }
      : defaultRubroFormValues
  );
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setValues((previousValues) => ({ ...previousValues, [field]: value }));
    setErrors((previousErrors) => ({ ...previousErrors, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateRubroForm(values, rubros, currentProject?.id, rubro?.id ?? null);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    onSave(values);
  };

  return (
    <ModalShell
      title={isEditMode ? 'Editar rubro' : 'Nuevo rubro'}
      description="Complete los datos del rubro como si luego fueran enviados a un endpoint real de administración."
      onClose={onCancel}
      widthClass="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]">
          Proyecto actual: <span className="font-semibold">{getRubroContextLabel(currentProject)}</span>
        </div>

        {errors.project ? <div className="rounded-[12px] border border-[#DC2626]/15 bg-[#DC2626]/10 px-4 py-3 text-sm font-medium text-[#B91C1C]">{errors.project}</div> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field id="rubro-code" label="Código" value={values.code} error={errors.code} onChange={(value) => handleChange('code', value)} placeholder="RB-401" />
          <Field id="rubro-unit" label="Unidad" value={values.unit} error={errors.unit} onChange={(value) => handleChange('unit', value)} placeholder="m2" />
        </div>

        <TextAreaField id="rubro-description" label="Descripción" value={values.description} error={errors.description} onChange={(value) => handleChange('description', value)} placeholder="Descripción del rubro" />

        <div className="grid gap-4 md:grid-cols-3">
          <Field id="rubro-unit-price" label="Precio unitario" type="number" value={values.unitPrice} error={errors.unitPrice} onChange={(value) => handleChange('unitPrice', value)} placeholder="580000" />
          <Field id="rubro-budgeted-quantity" label="Cantidad presupuestada" type="number" value={values.budgetedQuantity} error={errors.budgetedQuantity} onChange={(value) => handleChange('budgetedQuantity', value)} placeholder="1200" />
          <SelectField id="rubro-status" label="Estado" value={String(values.isActive)} onChange={(value) => handleChange('isActive', value === 'true')} options={[{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }]} />
        </div>

        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-gray-600">
          La validación evita códigos duplicados dentro del proyecto y valores económicos inválidos, manteniendo la pantalla lista para integrarse luego con backend real.
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">Cancelar</button>
          <button type="submit" className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">{isEditMode ? 'Guardar cambios' : 'Crear rubro'}</button>
        </div>
      </form>
    </ModalShell>
  );
}

function Field({ id, label, value, error, onChange, placeholder = '', type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#2F3A45]">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[44px] w-full rounded-[12px] border px-3 text-sm focus:outline-none focus:ring-1 ${error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'}`}
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p> : null}
    </div>
  );
}

function TextAreaField({ id, label, value, error, onChange, placeholder = '' }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#2F3A45]">{label}</label>
      <textarea
        id={id}
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-[12px] border px-3 py-3 text-sm focus:outline-none focus:ring-1 ${error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'}`}
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p> : null}
    </div>
  );
}

function SelectField({ id, label, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#2F3A45]">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}