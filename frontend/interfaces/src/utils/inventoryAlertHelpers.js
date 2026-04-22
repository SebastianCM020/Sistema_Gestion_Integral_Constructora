export function getAlertSeverityMeta(severity) {
  if (severity === 'critical') {
    return { label: 'Crítica', tone: 'danger' };
  }

  return { label: 'Advertencia', tone: 'warning' };
}

export function getAlertTypeMeta(alertType) {
  if (alertType === 'insufficient-stock') {
    return { label: 'Stock insuficiente', tone: 'danger' };
  }

  return { label: 'Excedente detectado', tone: 'warning' };
}

export function sortInventoryAlerts(alerts) {
  return [...alerts].sort((leftAlert, rightAlert) => new Date(rightAlert.fecha).getTime() - new Date(leftAlert.fecha).getTime());
}