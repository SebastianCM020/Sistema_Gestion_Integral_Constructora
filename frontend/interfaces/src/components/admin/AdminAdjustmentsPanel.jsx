import React from 'react';
import { SettingsSectionCard } from './SettingsSectionCard.jsx';
import { SettingsBooleanToggle } from './SettingsBooleanToggle.jsx';
import { SettingsFormField } from './SettingsFormField.jsx';

export function AdminAdjustmentsPanel({ adjustments, errors, onChangeAdjustment, onOpenDetail }) {
  return (
    <SettingsSectionCard title="Ajustes administrativos" description="Controle configuraciones operativas de alto impacto y revise el efecto esperado antes de guardar.">
      <div className="grid gap-4 xl:grid-cols-2">
        {adjustments.map((setting) => (
          setting.settingType === 'boolean'
            ? <SettingsBooleanToggle key={setting.settingKey} setting={setting} checked={setting.currentValue} onToggle={onChangeAdjustment} onOpenDetail={onOpenDetail} />
            : <SettingsFormField key={setting.settingKey} setting={setting} value={setting.currentValue} errorMessage={errors[setting.settingKey]} onChange={onChangeAdjustment} onOpenDetail={onOpenDetail} />
        ))}
      </div>
    </SettingsSectionCard>
  );
}