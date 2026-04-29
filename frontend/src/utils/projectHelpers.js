export const defaultProjectFilters = {
  query: '',
  status: 'all',
  manager: 'all',
  sortBy: 'updatedAt',
};

export const defaultProjectFormValues = {
  code:              '',
  name:              '',
  description:       '',
  contractorEntity:  '',
  contractNumber:    '',
  totalBudget:       '',
  startDate:         '',
  plannedEndDate:    '',
  status:            'active',
  idResponsable:     '',
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
  const num = Number(value);
  if (isNaN(num)) return 'Sin presupuesto';

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatShortDate(dateValue) {
  if (!dateValue) {
    return 'Sin definir';
  }

  try {
    // Si ya es un objeto Date, usarlo directamente
    let dateObj = dateValue instanceof Date ? dateValue : null;

    if (!dateObj) {
      // Si es un string que parece YYYY-MM-DD (longitud 10), aplicar el parche T00 para evitar desfase de zona horaria
      if (typeof dateValue === 'string' && dateValue.length === 10) {
        dateObj = new Date(`${dateValue}T00:00:00`);
      } else {
        dateObj = new Date(dateValue);
      }
    }

    // Validar que la fecha sea válida antes de formatear
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }

    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting short date:', error);
    return 'Error fecha';
  }
}

export function formatDateTime(dateValue) {
  if (!dateValue) {
    return 'Sin registro';
  }

  try {
    const dateObj = new Date(dateValue);
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';

    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    return 'Error fecha';
  }
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
  return projects.filter((project) => {
    const normalizedQuery = (filters.query || '').trim().toLowerCase();
    
    // Normalización de campos para búsqueda
    const code   = (project.code   || project.codigo || '').toLowerCase();
    const name   = (project.name   || project.nombre || '').toLowerCase();
    const entity = (project.contractorEntity || project.entidadContratante || '').toLowerCase();
    
    const matchesQuery = !normalizedQuery || 
                        code.includes(normalizedQuery) || 
                        name.includes(normalizedQuery) || 
                        entity.includes(normalizedQuery);

    // Normalización de estado (comparación insensible a mayúsculas)
    const projectStatus = (project.status || project.estado || '').toLowerCase();
    const filterStatus  = (filters.status || 'all').toLowerCase();
    const matchesStatus = filterStatus === 'all' || projectStatus === filterStatus;

    // Normalización de responsable (comparación de IDs)
    const projectManager = project.idResponsable || project.responsableId || '';
    const filterManager  = filters.manager || 'all';
    const matchesManager = filterManager === 'all' || projectManager === filterManager;

    return matchesQuery && matchesStatus && matchesManager;
  });
}

export function sortProjects(projects, sortBy) {
  const nextProjects = [...projects];

  nextProjects.sort((l, r) => {
    if (sortBy === 'name') {
      const ln = l.name || l.nombre || '';
      const rn = r.name || r.nombre || '';
      return ln.localeCompare(rn, 'es');
    }

    if (sortBy === 'code') {
      const lc = l.code || l.codigo || '';
      const rc = r.code || r.codigo || '';
      return lc.localeCompare(rc, 'es');
    }

    if (sortBy === 'startDate') {
      const ld = new Date(l.startDate || l.fechaInicio || 0).getTime();
      const rd = new Date(r.startDate || r.fechaInicio || 0).getTime();
      return rd - ld; // Descendente
    }

    // Default: updatedAt desc
    const lu = new Date(l.updatedAt || 0).getTime();
    const ru = new Date(r.updatedAt || 0).getTime();
    return ru - lu;
  });

  return nextProjects;
}

export function getProjectSummary(projects) {
  return projects.reduce(
    (summary, project) => {
      summary.total += 1;
      // Acepta campos en español o inglés
      const st = project.estado || project.status || '';

      if (st === 'active'    || st === 'ACTIVO')     summary.active    += 1;
      if (st === 'suspended' || st === 'SUSPENDIDO') summary.suspended += 1;
      if (st === 'closed'    || st === 'CERRADO')    summary.closed    += 1;

      return summary;
    },
    { total: 0, active: 0, suspended: 0, closed: 0 }
  );
}

export function validateProjectForm(values, projects, currentProjectId = null) {
  const errors = {};

  // Soporta campos en español (backend) e inglés (modal/mock)
  const code             = (values.code              ?? values.codigo             ?? '').trim();
  const name             = (values.name              ?? values.nombre             ?? '').trim();
  const contractorEntity = (values.contractorEntity  ?? values.entidadContratante ?? '').trim();
  const totalBudget      =  values.totalBudget       ?? values.presupuestoTotal;
  const startDate        =  values.startDate         ?? values.fechaInicio        ?? '';
  const plannedEndDate   =  values.plannedEndDate     ?? values.fechaFinPrevista   ?? '';
  const status           =  values.status            ?? values.estado             ?? '';

  if (!code) {
    errors.code = 'El código del proyecto es obligatorio.';
  } else {
    const dup = projects.find(
      (p) => (p.code || p.codigo || '').toLowerCase() === code.toLowerCase() && p.id !== currentProjectId
    );
    if (dup) errors.code = 'Ya existe un proyecto registrado con este código.';
  }

  if (!name)             errors.name             = 'El nombre del proyecto es obligatorio.';
  if (!contractorEntity) errors.contractorEntity  = 'La entidad contratante es obligatoria.';

  if (!totalBudget && totalBudget !== 0) {
    errors.totalBudget = 'El presupuesto total es obligatorio.';
  } else if (Number(totalBudget) <= 0) {
    errors.totalBudget = 'El presupuesto total debe ser positivo.';
  }

  if (!startDate)      errors.startDate      = 'La fecha de inicio es obligatoria.';
  if (!plannedEndDate) errors.plannedEndDate = 'La fecha fin prevista es obligatoria.';
  else if (startDate && plannedEndDate < startDate)
    errors.plannedEndDate = 'La fecha fin prevista no puede ser anterior a la fecha de inicio.';

  if (!status)          errors.status         = 'Seleccione un estado para continuar.';
  if (!values.idResponsable) errors.idResponsable = 'Defina un responsable para el proyecto.';

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
    idResponsable: values.idResponsable,
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
    idResponsable: values.idResponsable,
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