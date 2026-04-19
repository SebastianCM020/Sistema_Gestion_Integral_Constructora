const fieldLabels = {
  requesterEmail: 'Correo corporativo',
  moduleId: 'Modulo',
  projectCode: 'Proyecto',
  validUntil: 'Vigencia',
  justification: 'Justificacion',
  email: 'Correo electronico',
  password: 'Contrasena',
};

function isCorporateEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

function isProjectCodeValid(value) {
  return /^[A-Z]{3}-\d{2}$/.test(value);
}

function isDateWithinNinetyDays(value) {
  if (!value) {
    return false;
  }

  const currentDate = new Date('2026-04-12T12:00:00.000Z');
  const inputDate = new Date(`${value}T12:00:00.000Z`);
  const diffInMilliseconds = inputDate.getTime() - currentDate.getTime();
  const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

  return diffInDays >= 0 && diffInDays <= 90;
}

export function validateAccessRequestForm(values) {
  const nextErrors = {};

  if (!values.requesterEmail) {
    nextErrors.requesterEmail = 'Este campo es obligatorio.';
  } else if (!isCorporateEmail(values.requesterEmail)) {
    nextErrors.requesterEmail = 'Verifique el formato ingresado.';
  }

  if (!values.moduleId) {
    nextErrors.moduleId = 'Seleccione un modulo para continuar.';
  }

  if (!values.projectCode) {
    nextErrors.projectCode = 'Ingrese un proyecto o frente valido.';
  } else if (!isProjectCodeValid(values.projectCode)) {
    nextErrors.projectCode = 'Use un codigo como ALT-01 o TOR-03.';
  }

  if (!values.validUntil) {
    nextErrors.validUntil = 'Defina la vigencia de la solicitud.';
  } else if (!isDateWithinNinetyDays(values.validUntil)) {
    nextErrors.validUntil = 'La vigencia no puede superar noventa dias.';
  }

  if (!values.justification.trim()) {
    nextErrors.justification = 'Explique el motivo para continuar.';
  } else if (values.justification.trim().length < 20) {
    nextErrors.justification = 'Ingrese una justificacion mas clara y especifica.';
  }

  return nextErrors;
}

export function buildFormValidationSummary(errors) {
  return Object.entries(errors)
    .filter(([, message]) => Boolean(message))
    .map(([field, message]) => ({
      id: field,
      label: fieldLabels[field] ?? field,
      message,
    }));
}

export function getInlineValidatorState(fieldName, value, errors) {
  if (errors[fieldName]) {
    return { tone: 'error', label: errors[fieldName] };
  }

  if (!value) {
    return { tone: 'neutral', label: 'Complete este campo para validar el contexto.' };
  }

  return { tone: 'success', label: 'Dato validado en el contexto visible.' };
}

export function focusFirstInvalidField(errors) {
  const firstInvalidField = Object.keys(errors)[0];

  if (!firstInvalidField) {
    return;
  }

  window.requestAnimationFrame(() => {
    const element = document.getElementById(`system-field-${firstInvalidField}`) || document.getElementById(firstInvalidField);
    element?.focus();
  });
}

export function isFormDirty(values, defaults) {
  return Object.keys(defaults).some((key) => values[key] !== defaults[key]);
}