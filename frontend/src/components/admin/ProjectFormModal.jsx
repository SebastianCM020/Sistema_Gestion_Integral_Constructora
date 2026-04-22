import React, { useState } from 'react';
import { ModalShell } from '../ui/ModalShell.jsx';
import { defaultProjectFormValues, validateProjectForm } from '../../utils/projectHelpers.js';

export function ProjectFormModal({ project, projects, onCancel, onSave }) {
  const isEditMode = Boolean(project);
  const [values, setValues] = useState(
    project
      ? {
          code: project.code,
          name: project.name,
          description: project.description,
          contractorEntity: project.contractorEntity,
          contractNumber: project.contractNumber,
          totalBudget: String(project.totalBudget),
          startDate: project.startDate,
          plannedEndDate: project.plannedEndDate,
          status: project.status,
          managerName: project.managerName,
        }
      : defaultProjectFormValues
  );
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setValues((previousValues) => ({ ...previousValues, [field]: value }));
    setErrors((previousErrors) => ({ ...previousErrors, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateProjectForm(values, projects, project?.id ?? null);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    onSave(values);
  };

  return (
    <ModalShell
      title={isEditMode ? 'Editar proyecto' : 'Nuevo proyecto'}
      description="Complete la ficha general del proyecto como si luego fuera enviada a un endpoint real de administración."
      onClose={onCancel}
      widthClass="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="project-code" label="Código" value={values.code} error={errors.code} onChange={(value) => handleChange('code', value)} placeholder="ALT-06" />
          <Field id="project-name" label="Nombre del proyecto" value={values.name} error={errors.name} onChange={(value) => handleChange('name', value)} placeholder="Nombre del proyecto" />
        </div>

        <TextAreaField id="project-description" label="Descripción" value={values.description} error={errors.description} onChange={(value) => handleChange('description', value)} placeholder="Descripción general del proyecto" />

        <div className="grid gap-4 md:grid-cols-2">
          <Field id="project-contractor" label="Entidad contratante" value={values.contractorEntity} error={errors.contractorEntity} onChange={(value) => handleChange('contractorEntity', value)} placeholder="Entidad contratante" />
          <Field id="project-contract" label="Número de contrato" value={values.contractNumber} error={errors.contractNumber} onChange={(value) => handleChange('contractNumber', value)} placeholder="CT-2026-014" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field id="project-budget" label="Presupuesto total" value={values.totalBudget} error={errors.totalBudget} onChange={(value) => handleChange('totalBudget', value)} placeholder="1500000000" type="number" />
          <DateField id="project-start" label="Fecha de inicio" value={values.startDate} error={errors.startDate} onChange={(value) => handleChange('startDate', value)} />
          <DateField id="project-end" label="Fecha fin prevista" value={values.plannedEndDate} error={errors.plannedEndDate} onChange={(value) => handleChange('plannedEndDate', value)} />
          <SelectField id="project-status" label="Estado" value={values.status} error={errors.status} onChange={(value) => handleChange('status', value)} options={[{ value: 'active', label: 'Activo' }, { value: 'suspended', label: 'Suspendido' }, { value: 'closed', label: 'Cerrado' }]} />
        </div>

        <Field id="project-manager" label="Responsable" value={values.managerName} error={errors.managerName} onChange={(value) => handleChange('managerName', value)} placeholder="Nombre del responsable" />

        <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-gray-600">
          La validación evita códigos duplicados, presupuestos inválidos y rangos de fecha inconsistentes para facilitar luego la integración con backend sin rehacer esta pantalla.
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" className="h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">
            {isEditMode ? 'Guardar cambios' : 'Crear proyecto'}
          </button>
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

function DateField({ id, label, value, error, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#2F3A45]">{label}</label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[44px] w-full rounded-[12px] border px-3 text-sm focus:outline-none focus:ring-1 ${error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'}`}
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p> : null}
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
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error ? <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p> : null}
    </div>
  );
}