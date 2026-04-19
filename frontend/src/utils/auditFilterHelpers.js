import { formatAuditModuleLabel, getAuditOperationMeta, getAuditSeverityMeta } from './auditHelpers.js';

export function getDefaultAuditFilters() {
  return {
    dateFrom: '2026-04-05',
    dateTo: '2026-04-11',
    userId: 'all',
    projectId: 'all',
    moduleId: 'all',
    operationType: 'all',
    severity: 'all',
    entityType: 'all',
    search: '',
    onlyCritical: false,
    onlyWithChanges: false,
  };
}

export function buildAuditProjectOptions(assignedProjects, events) {
  const projectMap = new Map();

  assignedProjects.forEach((project) => {
    projectMap.set(project.id, {
      id: project.id,
      label: `${project.code} · ${project.name}`,
    });
  });

  events.filter((event) => event.projectId).forEach((event) => {
    if (!projectMap.has(event.projectId)) {
      projectMap.set(event.projectId, {
        id: event.projectId,
        label: `${event.projectCode} · ${event.projectName}`,
      });
    }
  });

  return [
    { id: 'all', label: 'Todos los proyectos' },
    ...Array.from(projectMap.values()),
    { id: 'system', label: 'Eventos sin proyecto' },
  ];
}

export function buildAuditUserOptions(events) {
  const userMap = new Map();

  events.forEach((event) => {
    if (!userMap.has(event.userId)) {
      userMap.set(event.userId, {
        id: event.userId,
        label: `${event.userName} · ${event.userRole}`,
      });
    }
  });

  return [{ id: 'all', label: 'Todos los usuarios' }, ...Array.from(userMap.values())];
}

export function buildAuditModuleOptions(events) {
  const moduleIds = Array.from(new Set(events.map((event) => event.module)));

  return [{ id: 'all', label: 'Todos los modulos' }, ...moduleIds.map((moduleId) => ({ id: moduleId, label: formatAuditModuleLabel(moduleId) }))];
}

export function buildAuditOperationOptions(events) {
  const operationTypes = Array.from(new Set(events.map((event) => event.operationType)));

  return [{ id: 'all', label: 'Todas las operaciones' }, ...operationTypes.map((operationType) => ({ id: operationType, label: getAuditOperationMeta(operationType).label }))];
}

export function buildAuditSeverityOptions(events) {
  const severities = Array.from(new Set(events.map((event) => event.severity)));

  return [{ id: 'all', label: 'Todas las severidades' }, ...severities.map((severity) => ({ id: severity, label: getAuditSeverityMeta(severity).label }))];
}

export function buildAuditEntityTypeOptions(events) {
  const entityTypes = Array.from(new Set(events.map((event) => event.entityType)));

  return [{ id: 'all', label: 'Todos los tipos de entidad' }, ...entityTypes.map((entityType) => ({ id: entityType, label: entityType }))];
}

function containsSearchValue(event, searchValue) {
  if (!searchValue) {
    return true;
  }

  const haystack = [
    event.userName,
    event.userRole,
    event.projectCode,
    event.projectName,
    event.module,
    event.entityType,
    event.entityId,
    event.requestId,
    event.reference,
    event.summary,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(searchValue.toLowerCase());
}

export function applyAuditFilters(events, filters) {
  return [...events]
    .filter((event) => {
      const eventDate = event.timestamp.slice(0, 10);
      return eventDate >= filters.dateFrom && eventDate <= filters.dateTo;
    })
    .filter((event) => (filters.userId === 'all' ? true : event.userId === filters.userId))
    .filter((event) => {
      if (filters.projectId === 'all') {
        return true;
      }

      if (filters.projectId === 'system') {
        return !event.projectId;
      }

      return event.projectId === filters.projectId;
    })
    .filter((event) => (filters.moduleId === 'all' ? true : event.module === filters.moduleId))
    .filter((event) => (filters.operationType === 'all' ? true : event.operationType === filters.operationType))
    .filter((event) => (filters.severity === 'all' ? true : event.severity === filters.severity))
    .filter((event) => (filters.entityType === 'all' ? true : event.entityType === filters.entityType))
    .filter((event) => (filters.onlyCritical ? event.isCritical || event.severity === 'critical' : true))
    .filter((event) => (filters.onlyWithChanges ? event.hasFieldChanges : true))
    .filter((event) => containsSearchValue(event, filters.search.trim()))
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
}

export function getFirstCriticalAuditEvent(events) {
  return events.find((event) => event.isCritical || event.severity === 'critical') ?? null;
}