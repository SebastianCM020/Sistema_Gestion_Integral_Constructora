const auditOperationMeta = {
  create: { label: 'Creacion', tone: 'success' },
  update: { label: 'Actualizacion', tone: 'info' },
  delete: { label: 'Eliminacion', tone: 'danger' },
  approve: { label: 'Aprobacion', tone: 'success' },
  assign: { label: 'Asignacion', tone: 'info' },
  login: { label: 'Acceso', tone: 'warning' },
  generate: { label: 'Generacion', tone: 'info' },
  close: { label: 'Cierre', tone: 'warning' },
};

const auditSeverityMeta = {
  low: { label: 'Baja', tone: 'neutral' },
  medium: { label: 'Media', tone: 'info' },
  high: { label: 'Alta', tone: 'warning' },
  critical: { label: 'Critica', tone: 'danger' },
};

const auditModuleLabels = {
  administration: 'Administracion',
  projects: 'Proyectos',
  rubros: 'Rubros',
  catalog: 'Catalogo',
  review: 'Revision',
  requirements: 'Requerimientos',
  inventory: 'Inventario',
  accounting: 'Contabilidad',
  payroll: 'Planillas',
  reports: 'Reportes',
  audit: 'Auditoria',
};

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Bogota',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Bogota',
});

function parseAuditDateValue(value) {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }

  return new Date(value);
}

export function getAuditOperationMeta(operationType) {
  return auditOperationMeta[operationType] ?? { label: operationType ?? 'Operacion', tone: 'neutral' };
}

export function getAuditSeverityMeta(severity) {
  return auditSeverityMeta[severity] ?? { label: severity ?? 'Sin severidad', tone: 'neutral' };
}

export function formatAuditDate(value) {
  if (!value) {
    return 'Sin fecha';
  }

  return dateFormatter.format(parseAuditDateValue(value));
}

export function formatAuditTimestamp(value) {
  if (!value) {
    return 'Sin fecha visible';
  }

  return dateTimeFormatter.format(parseAuditDateValue(value));
}

export function formatAuditModuleLabel(moduleId) {
  return auditModuleLabels[moduleId] ?? moduleId ?? 'Modulo';
}

export function formatAuditProjectLabel(event) {
  if (event?.projectCode && event?.projectName) {
    return `${event.projectCode} · ${event.projectName}`;
  }

  return 'Sin proyecto asociado';
}

export function formatAuditReference(event) {
  return event?.requestId || event?.reference || event?.entityId || 'Sin referencia';
}

export function buildAuditSummaryCards(events) {
  const usersWithActivity = new Set(events.map((event) => event.userId)).size;
  const projectsWithActivity = new Set(events.filter((event) => event.projectId).map((event) => event.projectId)).size;
  const criticalEvents = events.filter((event) => event.isCritical || event.severity === 'critical').length;
  const eventsWithChanges = events.filter((event) => event.hasFieldChanges).length;

  return [
    {
      id: 'total-events',
      label: 'Eventos visibles',
      value: `${events.length}`,
      description: 'Registros que cumplen el filtro actual.',
    },
    {
      id: 'users-activity',
      label: 'Usuarios con actividad',
      value: `${usersWithActivity}`,
      description: 'Actores involucrados en el corte visible.',
    },
    {
      id: 'projects-activity',
      label: 'Proyectos con actividad',
      value: `${projectsWithActivity}`,
      description: 'Obras o alcances que tuvieron trazabilidad reciente.',
    },
    {
      id: 'sensitive-events',
      label: 'Eventos sensibles',
      value: `${criticalEvents}`,
      description: `${eventsWithChanges} eventos muestran comparacion de cambios.`,
    },
  ];
}

export function buildAuditFilterSummary(filters, labels) {
  const userLabel = labels.userLabel ?? 'todos los usuarios';
  const projectLabel = labels.projectLabel ?? 'todos los proyectos';
  const moduleLabel = labels.moduleLabel ?? 'todos los modulos';
  const operationLabel = labels.operationLabel ?? 'todas las operaciones';
  const severityLabel = labels.severityLabel ?? 'todas las severidades';

  return `${formatAuditDate(filters.dateFrom)} a ${formatAuditDate(filters.dateTo)} · ${userLabel} · ${projectLabel} · ${moduleLabel} · ${operationLabel} · ${severityLabel}`;
}

export function buildAuditResultsLabel(visibleCount, totalCount) {
  return `${visibleCount} de ${totalCount} eventos visibles en el rango consultado.`;
}