import React from 'react';

export function SettingsBooleanToggle({ setting, checked, onToggle, onOpenDetail }) {
  return (
    <article className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC]/50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#2F3A45]">{setting.settingLabel}</p>
          <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
          {setting.impactLabel ? <p className="mt-2 text-xs text-[#1F4E79]">Impacto: {setting.impactLabel}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onOpenDetail(setting)} className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#D1D5DB] px-3 text-xs font-medium text-[#2F3A45] hover:bg-white">Detalle</button>
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onToggle(setting, !checked)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${checked ? 'bg-[#1F4E79]' : 'bg-[#D1D5DB]'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs font-medium text-gray-500">Estado actual: {checked ? 'Activo' : 'Inactivo'}</p>
    </article>
  );
}