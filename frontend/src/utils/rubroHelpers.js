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
  if (!projectId) return [];
  // Acepta tanto projectId (UI) como idProyecto (backend)
  return rubros.filter(
    (rubro) => (rubro.projectId ?? rubro.idProyecto) === projectId
  );
}

export function filterRubros(rubros, filters) {
  const normalizedQuery = (filters.query ?? '').trim().toLowerCase();

  return rubros.filter((rubro) => {
    // Acepta campos en español (backend) o inglés (UI)
    const code        = (rubro.code        ?? rubro.codigo      ?? '').toLowerCase();
    const description = (rubro.description ?? rubro.descripcion ?? '').toLowerCase();
    const unit        =  rubro.unit        ?? rubro.unidad      ?? '';
    const isActive    =  rubro.isActive    ?? rubro.activo      ?? true;

    const matchesQuery =
      !normalizedQuery ||
      code.includes(normalizedQuery) ||
      description.includes(normalizedQuery);

    const matchesUnit   = filters.unit   === 'all' || unit === filters.unit;
    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'active'   && isActive) ||
      (filters.status === 'inactive' && !isActive);

    return matchesQuery && matchesUnit && matchesStatus;
  });
}

export function sortRubros(rubros, sortBy) {
  const nextRubros = [...rubros];

  nextRubros.sort((l, r) => {
    const lCode = l.code ?? l.codigo ?? '';
    const rCode = r.code ?? r.codigo ?? '';
    const lDesc = l.description ?? l.descripcion ?? '';
    const rDesc = r.description ?? r.descripcion ?? '';
    const lPrice = l.unitPrice ?? l.precioUnitario ?? 0;
    const rPrice = r.unitPrice ?? r.precioUnitario ?? 0;

    if (sortBy === 'code')        return lCode.localeCompare(rCode, 'es');
    if (sortBy === 'description') return lDesc.localeCompare(rDesc, 'es');
    if (sortBy === 'unitPrice')   return rPrice - lPrice;

    return new Date(r.updatedAt || 0).getTime() - new Date(l.updatedAt || 0).getTime();
  });

  return nextRubros;
}

export function getRubroSummary(rubros, latestImportResult) {
  const activeRubros   = rubros.filter((r) => (r.isActive ?? r.activo ?? true)).length;
  const importedRubros = rubros.filter((r) => r.source === 'csv').length;

  return {
    totalRubros:       rubros.length,
    activeRubros,
    importedRubros,
    lastImportRows:   latestImportResult?.importedRows ?? 0,
    lastImportErrors: latestImportResult?.failedRows   ?? 0,
  };
}

export function validateRubroForm(values, existingRubros, currentProjectId, currentRubroId = null) {
  const errors = {};

  if (!currentProjectId) {
    errors.project = 'Seleccione un proyecto para continuar.';
  }

  const code = (values.code ?? '').trim();
  if (!code) {
    errors.code = 'El código del rubro es obligatorio.';
  } else {
    const dup = existingRubros.find(
      (r) =>
        (r.projectId ?? r.idProyecto) === currentProjectId &&
        (r.code ?? r.codigo ?? '').toLowerCase() === code.toLowerCase() &&
        r.id !== currentRubroId
    );
    if (dup) errors.code = 'Ya existe un rubro con este código dentro del proyecto.';
  }

  if (!(values.description ?? '').trim()) errors.description = 'La descripción es obligatoria.';
  if (!(values.unit         ?? '').trim()) errors.unit        = 'La unidad es obligatoria.';

  const unitPrice = values.unitPrice ?? values.precioUnitario;
  if (!unitPrice && unitPrice !== 0) {
    errors.unitPrice = 'El precio unitario es obligatorio.';
  } else if (Number(unitPrice) < 0) {
    errors.unitPrice = 'El precio unitario no puede ser negativo.';
  }

  const budgetedQty = values.budgetedQuantity ?? values.cantidadPresupuestada;
  if (!budgetedQty && budgetedQty !== 0) {
    errors.budgetedQuantity = 'La cantidad presupuestada es obligatoria.';
  } else if (Number(budgetedQty) <= 0) {
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
  return Array.from(
    new Set(rubros.map((r) => r.unit ?? r.unidad ?? '').filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'es'));
}

export function getRubroContextLabel(project) {
  if (!project) {
    return 'Sin proyecto seleccionado';
  }

  return `${project.code} · ${project.name}`;
}

export function formatRubroMetrics(rubro) {
  return {
    unitPrice:         formatCurrency(rubro.unitPrice        ?? rubro.precioUnitario      ?? 0),
    budgetedQuantity:  new Intl.NumberFormat('es-CO').format(rubro.budgetedQuantity  ?? rubro.cantidadPresupuestada ?? 0),
    executedQuantity:  new Intl.NumberFormat('es-CO').format(rubro.executedQuantity  ?? rubro.cantidadEjecutada    ?? 0),
  };
}