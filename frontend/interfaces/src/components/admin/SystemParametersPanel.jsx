import React from 'react';
import { SettingsSectionCard } from './SettingsSectionCard.jsx';
import { SettingsBooleanToggle } from './SettingsBooleanToggle.jsx';
import { SettingsFormField } from './SettingsFormField.jsx';

export function SystemParametersPanel({ groupedSettings, errors, onChangeSetting, onOpenDetail }) {
  return (
    <div className="space-y-6">
      {Object.entries(groupedSettings).map(([groupName, settings]) => (
        <SettingsSectionCard key={groupName} title={groupName} description="Revise y actualice parámetros globales preparados para consumir datos reales luego.">
          <div className="grid gap-4 xl:grid-cols-2">
            {settings.map((setting) => (
              setting.settingType === 'boolean'
                ? <SettingsBooleanToggle key={setting.settingKey} setting={setting} checked={setting.currentValue} onToggle={onChangeSetting} onOpenDetail={onOpenDetail} />
                : <SettingsFormField key={setting.settingKey} setting={setting} value={setting.currentValue} errorMessage={errors[setting.settingKey]} onChange={onChangeSetting} onOpenDetail={onOpenDetail} />
            ))}
          </div>
        </SettingsSectionCard>
      ))}
    </div>
  );
}