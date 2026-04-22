import { formatDateTime, formatShortDate } from './projectHelpers.js';

export const defaultProgressFormValues = {
  quantity: '',
  notes: '',
};

export function formatQuantity(value) {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function getProjectAccessLabel(accessMode) {
  if (accessMode === 'restricted-entry') {
    return 'Ingreso restringido';
  }

  return 'Acceso operativo';
}

export function getRubrosForProject(rubrosByProject, projectId) {
  return rubrosByProject[projectId] ?? [];
}

export function getActiveRubrosForProject(rubrosByProject, projectId) {
  return getRubrosForProject(rubrosByProject, projectId).filter((rubro) => rubro.isActive);
}

export function getSelectedProject(projects, projectId) {
  return projects.find((project) => project.id === projectId) ?? null;
}

export function getSelectedRubro(rubros, rubroId) {
  return rubros.find((rubro) => rubro.id === rubroId) ?? null;
}

export function validateProgressForm({ projectId, rubroId, quantity }) {
  const errors = {};
  const numericQuantity = Number(quantity);

  if (!projectId) {
    errors.projectId = 'Seleccione el proyecto asignado.';
  }

  if (!rubroId) {
    errors.rubroId = 'Seleccione un rubro para continuar.';
  }

  if (!quantity) {
    errors.quantity = 'Ingrese la cantidad ejecutada.';
  } else if (Number.isNaN(numericQuantity)) {
    errors.quantity = 'La cantidad debe ser numérica.';
  } else if (numericQuantity <= 0) {
    errors.quantity = 'La cantidad debe ser mayor a cero.';
  }

  return errors;
}

export function createProgressPayload({ project, rubro, values }) {
  const timestamp = new Date().toISOString();

  return {
    id: `prg-${Date.now()}`,
    projectId: project.id,
    projectCode: project.code,
    projectName: project.name,
    rubroId: rubro.id,
    rubroCode: rubro.code,
    rubroDescription: rubro.description,
    unit: rubro.unit,
    quantityAdvance: Number(values.quantity),
    notes: values.notes.trim(),
    registeredAt: timestamp,
    status: 'registered',
    syncStatus: 'pending',
  };
}

export function updateRubrosAfterProgress(rubrosByProject, projectId, rubroId, quantity) {
  return {
    ...rubrosByProject,
    [projectId]: (rubrosByProject[projectId] ?? []).map((rubro) =>
      rubro.id === rubroId
        ? {
            ...rubro,
            executedQuantity: rubro.executedQuantity + quantity,
            updatedAt: new Date().toISOString(),
          }
        : rubro
    ),
  };
}

export function hasProgressDraft(values, selectedRubroId) {
  return Boolean(selectedRubroId || values.quantity || values.notes.trim());
}

export function clearProgressForm() {
  return { ...defaultProgressFormValues };
}

export function getRubroBudgetMetrics(rubro) {
  const remainingQuantity = Math.max(rubro.budgetedQuantity - rubro.executedQuantity, 0);
  const progressPercent = rubro.budgetedQuantity ? Math.min((rubro.executedQuantity / rubro.budgetedQuantity) * 100, 100) : 0;

  return {
    remainingQuantity,
    progressPercent,
  };
}

export function getProjectProgressSummary(projects, currentProjectId, rubrosByProject, progressRecords) {
  const activeRubros = getActiveRubrosForProject(rubrosByProject, currentProjectId).length;
  const pendingSync = progressRecords.filter((record) => record.syncStatus === 'pending').length;
  const todayLabel = new Date().toISOString().slice(0, 10);
  const todayProgress = progressRecords
    .filter((record) => record.projectId === currentProjectId && record.registeredAt.slice(0, 10) === todayLabel)
    .reduce((total, record) => total + record.quantityAdvance, 0);

  return {
    assignedProjects: projects.length,
    activeRubros,
    pendingSync,
    todayProgress: formatQuantity(todayProgress),
  };
}

export function getProjectContextText(project) {
  if (!project) {
    return 'Sin proyecto asignado';
  }

  return `${project.code} · ${project.name}`;
}

export function getProjectDatesText(project) {
  if (!project) {
    return 'Sin vigencia disponible';
  }

  return `${formatShortDate(project.startDate)} a ${formatShortDate(project.endDate)}`;
}

export function formatProgressDate(dateValue) {
  return formatDateTime(dateValue);
}