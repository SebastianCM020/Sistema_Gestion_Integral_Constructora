import React from 'react';
import { FormFieldErrorMessage } from '../system/FormFieldErrorMessage.jsx';

export function SettingsFormField({ setting, value, errorMessage, onChange, onOpenDetail }) {
  const commonClassName = `mt-2 h-[44px] w-full rounded-[12px] border px-3 text-sm outline-none ${errorMessage ? 'border-[#DC2626]' : 'border-[#D1D5DB] bg-[#F7F9FC]'}`;

  return (
    <article className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC]/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#2F3A45]">{setting.settingLabel}</p>
          <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
          {setting.helpText ? <p className="mt-2 text-xs text-[#1F4E79]">{setting.helpText}</p> : null}
        </div>
        <button type="button" onClick={() => onOpenDetail(setting)} className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#D1D5DB] px-3 text-xs font-medium text-[#2F3A45] hover:bg-white">Detalle</button>
      </div>

      {setting.settingType === 'text' ? <input id={`setting-${setting.settingKey}`} type="text" value={value} onChange={(event) => onChange(setting, event.target.value)} className={commonClassName} /> : null}
      {setting.settingType === 'number' ? <input id={`setting-${setting.settingKey}`} type="number" value={value} onChange={(event) => onChange(setting, event.target.value)} className={commonClassName} /> : null}
      {setting.settingType === 'select' ? (
        <select id={`setting-${setting.settingKey}`} value={value} onChange={(event) => onChange(setting, event.target.value)} className={commonClassName}>
          {setting.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : null}

      <FormFieldErrorMessage fieldId={`setting-${setting.settingKey}`} message={errorMessage} />
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        <span>Valor actual: <span className="font-medium text-[#2F3A45]">{String(value)}</span></span>
        <span>Predeterminado: <span className="font-medium text-[#2F3A45]">{String(setting.defaultValue)}</span></span>
      </div>
    </article>
  );
}