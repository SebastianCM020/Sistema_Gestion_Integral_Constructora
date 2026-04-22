export const defaultProjectFilters = {
  query: '',
  status: 'all',
  manager: 'all',
  sortBy: 'updatedAt',
};

export const defaultProjectFormValues = {
  code: '',
  name: '',
  description: '',
  contractorEntity: '',
  contractNumber: '',
  totalBudget: '',
  startDate: '',
  plannedEndDate: '',
  status: 'active',
  managerName: '',
};

export const defaultProjectParametersValues = {
  budgetControlEnabled: true,
  inventoryControlEnabled: true,
  requiresDailyProgress: true,
  purchaseApprovalFlow: 'simple',
  evidenceSyncMode: 'required',
  reportCutoffDay: 'viernes',
  budgetAlertThreshold: 10,
  costCenterPrefix: '',
  notes: '',
};

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatShortDate(dateValue) {
  if (!dateValue) {
    return 'Sin definir';
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`));
}

export function formatDateTime(dateValue) {
  if (!dateValue) {
    return 'Sin registro';
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

export function getProjectStatusMeta(status) {
  if (status === 'suspended') {
    return { value: 'suspended', label: 'Suspendido', tone: 'warning' };
  }

  if (status === 'closed') {
    return { value: 'closed', label: 'Cerrado', tone: 'danger' };
  }

  return { value: 'active', label: 'Activo', tone: 'success' };
}

export function getProjectParametersById(parametersList, projectId) {
  return parametersList.find((parameter) => parameter.projectId === projectId) ?? null;
}

export function attachProjectParameters(projects, parametersList) {
  return projects.map((project) => ({
    ...project,
    parameters: getProjectParametersById(parametersList, project.id),
  }));
}

export function filterProjects(projects, filters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesQuery =
      !normalizedQuery ||
      project.code.toLowerCase().includes(normalizedQuery) ||
      project.name.toLowerCase().includes(normalizedQuery) ||
      project.contractorEntity.toLowerCase().includes(normalizedQuery);

    const matchesStatus = filters.status === 'all' || project.status === filters.status;
    const matchesManager = filters.manager === 'all' || project.managerName === filters.manager;

    return matchesQuery && matchesStatus && matchesManager;
  });
}

export function sortProjects(projects, sortBy) {
  const nextProjects = [...projects];

  nextProjects.sort((leftProject, rightProject) => {
    if (sortBy === 'name') {
      return leftProject.name.localeCompare(rightProject.name, 'es');
    }

    if (sortBy === 'code') {
      return leftProject.code.localeCompare(rightProject.code, 'es');
    }

    if (sortBy === 'startDate') {
      return new Date(rightProject.startDate).getTime() - new Date(leftProject.startDate).getTime();
    }

    return new Date(rightProject.updatedAt).getTime() - new Date(leftProject.updatedAt).getTime();
  });

  return nextProjects;
}

export function getProjectSummary(projects) {
  return projects.reduce(
    (summary, project) => {
      summary.total += 1;

      if (project.status === 'active') {
        summary.active += 1;
      }

      if (project.status === 'suspended') {
        summary.suspended += 1;
      }

      if (project.status === 'closed') {
        summary.closed += 1;
      }

      return summary;
    },
    { total: 0, active: 0, suspended: 0, closed: 0 }
  );
}

export function validateProjectForm(values, projects, currentProjectId = null) {
  const errors = {};

  if (!values.code.trim()) {
    errors.code = 'El código del proyecto es obligatorio.';
  } else {
    const duplicateProject = projects.find(
      (project) => project.code.toLowerCase() === values.code.trim().toLowerCase() && project.id !== currentProjectId
    );

    if (duplicateProject) {
      errors.code = 'Ya existe un proyecto registrado con este código.';
    }
  }

  if (!values.name.trim()) {
    errors.name = 'El nombre del proyecto es obligatorio.';
  }

  if (!values.contractorEntity.trim()) {
    errors.contractorEntity = 'La entidad contratante es obligatoria.';
  }

  if (!values.totalBudget && values.totalBudget !== 0) {
    errors.totalBudget = 'El presupuesto total es obligatorio.';
  } else if (Number(values.totalBudget) <= 0) {
    errors.totalBudget = 'El presupuesto total debe ser positivo.';
  }

  if (!values.startDate) {
    errors.startDate = 'La fecha de inicio es obligatoria.';
  }

  if (!values.plannedEndDate) {
    errors.plannedEndDate = 'La fecha fin prevista es obligatoria.';
  } else if (values.startDate && values.plannedEndDate < values.startDate) {
    errors.plannedEndDate = 'La fecha fin prevista no puede ser anterior a la fecha de inicio.';
  }

  if (!values.status) {
    errors.status = 'Seleccione un estado para continuar.';
  }

  if (!values.managerName.trim()) {
    errors.managerName = 'Defina un responsable para el proyecto.';
  }

  return errors;
}

export function createProjectPayload(values) {
  const timestamp = new Date().toISOString();

  return {
    id: `prj-${Date.now()}`,
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    description: values.description.trim(),
    contractorEntity: values.contractorEntity.trim(),
    contractNumber: values.contractNumber.trim(),
    totalBudget: Number(values.totalBudget),
    startDate: values.startDate,
    plannedEndDate: values.plannedEndDate,
    status: values.status,
    managerName: values.managerName.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateProjectPayload(project, values) {
  return {
    ...project,
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    description: values.description.trim(),
    contractorEntity: values.contractorEntity.trim(),
    contractNumber: values.contractNumber.trim(),
    totalBudget: Number(values.totalBudget),
    startDate: values.startDate,
    plannedEndDate: values.plannedEndDate,
    status: values.status,
    managerName: values.managerName.trim(),
    updatedAt: new Date().toISOString(),
  };
}

export function updateProjectStatusPayload(project, status) {
  return {
    ...project,
    status,
    updatedAt: new Date().toISOString(),
  };
}

export function updateProjectParametersPayload(existingParameters, projectId, values) {
  const timestamp = new Date().toISOString();

  return {
    id: existingParameters?.id ?? `prm-${Date.now()}`,
    projectId,
    budgetControlEnabled: values.budgetControlEnabled,
    inventoryControlEnabled: values.inventoryControlEnabled,
    requiresDailyProgress: values.requiresDailyProgress,
    purchaseApprovalFlow: values.purchaseApprovalFlow,
    evidenceSyncMode: values.evidenceSyncMode,
    reportCutoffDay: values.reportCutoffDay,
    budgetAlertThreshold: Number(values.budgetAlertThreshold),
    costCenterPrefix: values.costCenterPrefix.trim().toUpperCase(),
    notes: values.notes.trim(),
    updatedAt: timestamp,
  };
}

export function getParameterSummaryItems(project) {
  if (!project.parameters) {
    return [
      { id: 'missing-parameters', label: 'Parámetros operativos pendientes de configuración' },
    ];
  }

  return [
    { id: 'budget', label: project.parameters.budgetControlEnabled ? 'Control presupuestal activo' : 'Control presupuestal simplificado' },
    { id: 'inventory', label: project.parameters.inventoryControlEnabled ? 'Integración con inventario habilitada' : 'Inventario no integrado' },
    { id: 'progress', label: project.parameters.requiresDailyProgress ? 'Avance diario obligatorio' : 'Avance diario opcional' },
    { id: 'approvals', label: project.parameters.purchaseApprovalFlow === 'double' ? 'Aprobación doble para compras' : 'Aprobación simple para compras' },
  ];
}