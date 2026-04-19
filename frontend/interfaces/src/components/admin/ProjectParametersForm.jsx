import React from 'react';

export function ProjectParametersForm({ values, onChange }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <ToggleCard
          title="Control presupuestal"
          description="Active alertas y seguimiento de desviación del presupuesto del proyecto."
          checked={values.budgetControlEnabled}
          onChange={(checked) => onChange('budgetControlEnabled', checked)}
        />
        <ToggleCard
          title="Integración con inventario"
          description="Permite habilitar el control del proyecto dentro de recepción y movimientos de materiales."
          checked={values.inventoryControlEnabled}
          onChange={(checked) => onChange('inventoryControlEnabled', checked)}
        />
        <ToggleCard
          title="Avance diario obligatorio"
          description="Exige registro diario de avance para mantener seguimiento operativo consistente."
          checked={values.requiresDailyProgress}
          onChange={(checked) => onChange('requiresDailyProgress', checked)}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SelectField
          id="project-approval-flow"
          label="Flujo de aprobación de compras"
          value={values.purchaseApprovalFlow}
          onChange={(value) => onChange('purchaseApprovalFlow', value)}
          options={[{ value: 'simple', label: 'Aprobación simple' }, { value: 'double', label: 'Aprobación doble' }]}
        />
        <SelectField
          id="project-evidence-mode"
          label="Sincronización de evidencia"
          value={values.evidenceSyncMode}
          onChange={(value) => onChange('evidenceSyncMode', value)}
          options={[{ value: 'required', label: 'Obligatoria' }, { value: 'assisted', label: 'Asistida' }, { value: 'optional', label: 'Opcional' }]}
        />
        <SelectField
          id="project-cutoff-day"
          label="Día de corte de reportes"
          value={values.reportCutoffDay}
          onChange={(value) => onChange('reportCutoffDay', value)}
          options={[{ value: 'lunes', label: 'Lunes' }, { value: 'miercoles', label: 'Miércoles' }, { value: 'jueves', label: 'Jueves' }, { value: 'viernes', label: 'Viernes' }]}
        />
        <Field
          id="project-budget-threshold"
          label="Alerta presupuestal (%)"
          type="number"
          value={String(values.budgetAlertThreshold)}
          onChange={(value) => onChange('budgetAlertThreshold', value)}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Field
          id="project-cost-center-prefix"
          label="Prefijo centro de costo"
          value={values.costCenterPrefix}
          onChange={(value) => onChange('costCenterPrefix', value)}
          placeholder="ALT"
        />
        <TextAreaField
          id="project-parameter-notes"
          label="Observaciones operativas"
          value={values.notes}
          onChange={(value) => onChange('notes', value)}
          placeholder="Notas internas para la configuración del proyecto"
        />
      </section>
    </div>
  );
}

function ToggleCard({ title, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-[12px] border border-[#D1D5DB] bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-[#2F3A45]">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 rounded border-[#D1D5DB] text-[#1F4E79] focus:ring-[#1F4E79]"
      />
    </label>
  );
}

function Field({ id, label, value, onChange, placeholder = '', type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#2F3A45]">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] px-3 text-sm focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
      />
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