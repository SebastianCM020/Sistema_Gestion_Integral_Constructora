import { formatDateTime } from './projectHelpers.js';

export const defaultConsumptionFormValues = {
  quantity: '',
  observations: '',
};

export function formatConsumptionQuantity(value) {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function getSelectedProject(projects, projectId) {
  return projects.find((project) => project.id === projectId) ?? null;
}

export function getMaterialsForProject(inventoryByProject, projectId) {
  return inventoryByProject[projectId] ?? [];
}

export function getActiveMaterialsForProject(inventoryByProject, projectId) {
  return getMaterialsForProject(inventoryByProject, projectId).filter((material) => material.active);
}

export function filterMaterials(materials, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return materials;
  }

  return materials.filter((material) =>
    material.code.toLowerCase().includes(normalizedQuery) || material.name.toLowerCase().includes(normalizedQuery)
  );
}

export function getSelectedMaterial(materials, materialId) {
  return materials.find((material) => material.id === materialId) ?? null;
}

export function validateConsumptionForm({ projectId, materialId, quantity }) {
  const errors = {};
  const numericQuantity = Number(quantity);

  if (!projectId) {
    errors.projectId = 'Seleccione un proyecto asignado para continuar.';
  }

  if (!materialId) {
    errors.materialId = 'Seleccione un material para registrar el consumo.';
  }

  if (!quantity) {
    errors.quantity = 'Ingrese la cantidad consumida.';
  } else if (Number.isNaN(numericQuantity)) {
    errors.quantity = 'La cantidad consumida debe ser numérica.';
  } else if (numericQuantity <= 0) {
    errors.quantity = 'La cantidad consumida debe ser mayor a cero.';
  }

  return errors;
}

export function createConsumptionPayload({ project, material, values }) {
  const timestamp = new Date().toISOString();

  return {
    id: `con-${Date.now()}`,
    projectId: project.id,
    projectCode: project.code,
    projectName: project.name,
    materialId: material.id,
    materialCode: material.code,
    materialName: material.name,
    unit: material.unit,
    quantityConsumed: Number(values.quantity),
    observations: values.observations.trim(),
    registeredAt: timestamp,
    status: 'registered',
    syncStatus: 'pending',
    syncTimestamp: null,
  };
}

export function updateInventoryAfterConsumption(inventoryByProject, projectId, materialId, quantity) {
  return {
    ...inventoryByProject,
    [projectId]: (inventoryByProject[projectId] ?? []).map((material) =>
      material.id === materialId
        ? {
            ...material,
            availableQuantity: Math.max(material.availableQuantity - quantity, 0),
            lastUpdatedAt: new Date().toISOString(),
            syncStatus: 'pending',
          }
        : material
    ),
  };
}

export function hasConsumptionDraft(values, selectedMaterialId) {
  return Boolean(selectedMaterialId || values.quantity || values.observations.trim());
}

export function clearConsumptionForm() {
  return { ...defaultConsumptionFormValues };
}

export function getConsumptionSummary(projects, currentProjectId, inventoryByProject, consumptionRecords) {
  const activeMaterials = getActiveMaterialsForProject(inventoryByProject, currentProjectId).length;
  const pendingSync = consumptionRecords.filter((record) => record.syncStatus === 'pending').length;
  const todayLabel = new Date().toISOString().slice(0, 10);
  const todayConsumption = consumptionRecords
    .filter((record) => record.projectId === currentProjectId && record.registeredAt.slice(0, 10) === todayLabel)
    .reduce((total, record) => total + record.quantityConsumed, 0);

  return {
    assignedProjects: projects.length,
    availableMaterials: activeMaterials,
    pendingSync,
    todayConsumption: formatConsumptionQuantity(todayConsumption),
  };
}

export function formatConsumptionDate(dateValue) {
  return formatDateTime(dateValue);
}

export function getMaterialAvailabilityTone(material) {
  if (!material) {
    return 'neutral';
  }

  if (material.availableQuantity <= 0) {
    return 'danger';
  }

  if (material.availableQuantity <= (material.minimumThreshold ?? 0)) {
    return 'warning';
  }

  return 'success';
}