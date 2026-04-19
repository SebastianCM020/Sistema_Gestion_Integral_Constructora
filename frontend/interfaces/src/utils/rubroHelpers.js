import { formatCurrency } from './projectHelpers.js';

export const defaultRubroFilters = {
  query: '',
  unit: 'all',
  status: 'all',
  sortBy: 'updatedAt',
};

export const defaultRubroFormValues = {
  code: '',
  description: '',
  unit: '',
  unitPrice: '',
  budgetedQuantity: '',
  isActive: true,
};

export function getRubroStatusMeta(isActive) {
  return isActive
    ? { value: 'active', label: 'Activo', tone: 'success' }
    : { value: 'inactive', label: 'Inactivo', tone: 'warning' };
}

export function getProjectRubros(rubros, projectId) {
  return rubros.filter((rubro) => rubro.projectId === projectId);
}

export function filterRubros(rubros, filters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return rubros.filter((rubro) => {
    const matchesQuery =
      !normalizedQuery ||
      rubro.code.toLowerCase().includes(normalizedQuery) ||
      rubro.description.toLowerCase().includes(normalizedQuery);

    const matchesUnit = filters.unit === 'all' || rubro.unit === filters.unit;
    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'active' && rubro.isActive) ||
      (filters.status === 'inactive' && !rubro.isActive);

    return matchesQuery && matchesUnit && matchesStatus;
  });
}

export function sortRubros(rubros, sortBy) {
  const nextRubros = [...rubros];

  nextRubros.sort((leftRubro, rightRubro) => {
    if (sortBy === 'code') {
      return leftRubro.code.localeCompare(rightRubro.code, 'es');
    }

    if (sortBy === 'description') {
      return leftRubro.description.localeCompare(rightRubro.description, 'es');
    }

    if (sortBy === 'unitPrice') {
      return rightRubro.unitPrice - leftRubro.unitPrice;
    }

    return new Date(rightRubro.updatedAt).getTime() - new Date(leftRubro.updatedAt).getTime();
  });

  return nextRubros;
}

export function getRubroSummary(rubros, latestImportResult) {
  const activeRubros = rubros.filter((rubro) => rubro.isActive).length;
  const importedRubros = rubros.filter((rubro) => rubro.source === 'csv').length;

  return {
    totalRubros: rubros.length,
    activeRubros,
    importedRubros,
    lastImportRows: latestImportResult?.importedRows ?? 0,
    lastImportErrors: latestImportResult?.failedRows ?? 0,
  };
}

export function validateRubroForm(values, existingRubros, currentProjectId, currentRubroId = null) {
  const errors = {};

  if (!currentProjectId) {
    errors.project = 'Seleccione un proyecto para continuar.';
  }

  if (!values.code.trim()) {
    errors.code = 'El código del rubro es obligatorio.';
  } else {
    const duplicateRubro = existingRubros.find(
      (rubro) =>
        rubro.projectId === currentProjectId &&
        rubro.code.toLowerCase() === values.code.trim().toLowerCase() &&
        rubro.id !== currentRubroId
    );

    if (duplicateRubro) {
      errors.code = 'Ya existe un rubro con este código dentro del proyecto.';
    }
  }

  if (!values.description.trim()) {
    errors.description = 'La descripción es obligatoria.';
  }

  if (!values.unit.trim()) {
    errors.unit = 'La unidad es obligatoria.';
  }

  if (!values.unitPrice && values.unitPrice !== 0) {
    errors.unitPrice = 'El precio unitario es obligatorio.';
  } else if (Number(values.unitPrice) < 0) {
    errors.unitPrice = 'El precio unitario no puede ser negativo.';
  }

  if (!values.budgetedQuantity && values.budgetedQuantity !== 0) {
    errors.budgetedQuantity = 'La cantidad presupuestada es obligatoria.';
  } else if (Number(values.budgetedQuantity) <= 0) {
    errors.budgetedQuantity = 'La cantidad presupuestada debe ser positiva.';
  }

  return errors;
}

export function createRubroPayload(values, project) {
  const timestamp = new Date().toISOString();

  return {
    id: `rbr-${Date.now()}`,
    projectId: project.id,
    projectCode: project.code,
    projectName: project.name,
    code: values.code.trim().toUpperCase(),
    description: values.description.trim(),
    unit: values.unit.trim(),
    unitPrice: Number(values.unitPrice),
    budgetedQuantity: Number(values.budgetedQuantity),
    executedQuantity: 0,
    isActive: values.isActive,
    source: 'manual',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateRubroPayload(rubro, values, project) {
  return {
    ...rubro,
    projectId: project.id,
    projectCode: project.code,
    projectName: project.name,
    code: values.code.trim().toUpperCase(),
    description: values.description.trim(),
    unit: values.unit.trim(),
    unitPrice: Number(values.unitPrice),
    budgetedQuantity: Number(values.budgetedQuantity),
    isActive: values.isActive,
    updatedAt: new Date().toISOString(),
  };
}

export function getRubroUnits(rubros) {
  return Array.from(new Set(rubros.map((rubro) => rubro.unit))).sort((leftUnit, rightUnit) => leftUnit.localeCompare(rightUnit, 'es'));
}

export function getRubroContextLabel(project) {
  if (!project) {
    return 'Sin proyecto seleccionado';
  }

  return `${project.code} · ${project.name}`;
}

export function formatRubroMetrics(rubro) {
  return {
    unitPrice: formatCurrency(rubro.unitPrice),
    budgetedQuantity: new Intl.NumberFormat('es-CO').format(rubro.budgetedQuantity),
    executedQuantity: new Intl.NumberFormat('es-CO').format(rubro.executedQuantity),
  };
}