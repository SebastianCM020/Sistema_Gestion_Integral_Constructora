export function cloneSettingsCollection(collection) {
  return collection.map((item) => ({
    ...item,
    options: item.options ? item.options.map((option) => ({ ...option })) : undefined,
    validationRules: item.validationRules ? item.validationRules.map((rule) => ({ ...rule })) : [],
  }));
}

export function groupSettingsByGroup(settings) {
  return settings.reduce((accumulator, setting) => {
    if (!accumulator[setting.settingGroup]) {
      accumulator[setting.settingGroup] = [];
    }

    accumulator[setting.settingGroup].push(setting);
    return accumulator;
  }, {});
}

export function formatSettingValue(setting) {
  if (setting.settingType === 'boolean') {
    return setting.currentValue ? 'Activo' : 'Inactivo';
  }

  if (setting.settingType === 'select') {
    const selectedOption = setting.options?.find((option) => option.value === setting.currentValue);
    return selectedOption?.label ?? setting.currentValue;
  }

  return String(setting.currentValue ?? '');
}

export function normalizeSettingInput(setting, rawValue) {
  if (setting.settingType === 'number') {
    if (rawValue === '') {
      return '';
    }

    return Number(rawValue);
  }

  if (setting.settingType === 'boolean') {
    return Boolean(rawValue);
  }

  return rawValue;
}

function validateRule(setting, value, rule) {
  if (rule.type === 'required') {
    if (value === '' || value === null || value === undefined) {
      return 'Este campo es obligatorio.';
    }
  }

  if (rule.type === 'number' && value !== '' && Number.isNaN(Number(value))) {
    return 'Ingrese un valor numérico válido.';
  }

  if (rule.type === 'min' && value !== '' && Number(value) < rule.value) {
    return `El valor mínimo permitido es ${rule.value}.`;
  }

  if (rule.type === 'max' && value !== '' && Number(value) > rule.value) {
    return `El valor máximo permitido es ${rule.value}.`;
  }

  if (rule.type === 'pattern' && value !== '' && !(new RegExp(rule.value).test(String(value)))) {
    return 'El formato ingresado no cumple la convención esperada.';
  }

  return null;
}

export function validateSettingsCollection(settings) {
  const errors = {};

  settings.forEach((setting) => {
    const firstError = (setting.validationRules ?? []).map((rule) => validateRule(setting, setting.currentValue, rule)).find(Boolean);
    if (firstError) {
      errors[setting.settingKey] = firstError;
    }
  });

  return errors;
}

export function getSettingsConflicts(settings, adjustments) {
  const allSettings = [...settings, ...adjustments].reduce((accumulator, setting) => {
    accumulator[setting.settingKey] = setting.currentValue;
    return accumulator;
  }, {});

  const conflicts = [];

  if (Number(allSettings.idle_warning_minutes) >= Number(allSettings.session_timeout_minutes)) {
    conflicts.push({
      id: 'session-warning-conflict',
      title: 'La advertencia de inactividad supera o iguala el cierre de sesión',
      description: 'Ajuste el aviso previo para que siempre ocurra antes del cierre automático de la sesión.',
      affectedKeys: ['idle_warning_minutes', 'session_timeout_minutes'],
    });
  }

  if (allSettings.allow_manual_folio_override && allSettings.audit_snapshot_frequency === 'manual') {
    conflicts.push({
      id: 'audit-traceability-conflict',
      title: 'La trazabilidad manual deja sin evidencia suficiente los ajustes de folio',
      description: 'Si permite correcciones manuales de folio, mantenga snapshots automáticos para conservar trazabilidad.',
      affectedKeys: ['allow_manual_folio_override', 'audit_snapshot_frequency'],
    });
  }

  return conflicts;
}

export function countPendingSettingChanges(savedCollection, draftCollection) {
  return draftCollection.filter((draftItem) => {
    const originalItem = savedCollection.find((savedItem) => savedItem.settingKey === draftItem.settingKey);
    return originalItem && originalItem.currentValue !== draftItem.currentValue;
  }).length;
}

export function buildSettingsSummary({ settings, catalogs, adjustments, pendingChanges, conflicts }) {
  return [
    {
      id: 'editable-settings',
      label: 'Parámetros editables',
      value: settings.filter((setting) => setting.isEditable).length,
      helper: 'Configuraciones globales activas',
      tone: 'info',
    },
    {
      id: 'available-catalogs',
      label: 'Catálogos auxiliares',
      value: catalogs.length,
      helper: 'Listas maestras administrables',
      tone: 'info',
    },
    {
      id: 'pending-changes',
      label: 'Cambios pendientes',
      value: pendingChanges,
      helper: pendingChanges ? 'Requieren guardado o descarte' : 'Sin cambios pendientes',
      tone: pendingChanges ? 'warning' : 'success',
    },
    {
      id: 'conflicts',
      label: 'Conflictos detectados',
      value: conflicts.length,
      helper: conflicts.length ? 'Corrija antes de guardar' : 'Sin conflictos de configuración',
      tone: conflicts.length ? 'error' : 'success',
    },
    {
      id: 'administrative-adjustments',
      label: 'Ajustes administrativos',
      value: adjustments.length,
      helper: 'Opciones de alto impacto configurables',
      tone: 'info',
    },
  ];
}

export function buildValidationSummary(errors, settings) {
  return Object.entries(errors).map(([settingKey, message]) => {
    const setting = settings.find((item) => item.settingKey === settingKey);
    return {
      id: settingKey,
      label: setting?.settingLabel ?? settingKey,
      message,
    };
  });
}

export function buildSavePayload({ settings, adjustments, catalogs }) {
  return {
    settings: settings.map((item) => ({ key: item.settingKey, value: item.currentValue })),
    adjustments: adjustments.map((item) => ({ key: item.settingKey, value: item.currentValue })),
    catalogs: catalogs.map((catalog) => ({
      catalogId: catalog.catalogId,
      items: catalog.items.map((item) => ({ id: item.itemId, label: item.itemLabel, active: item.isActive })),
    })),
  };
}