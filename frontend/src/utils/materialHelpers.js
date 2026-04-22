import { formatDateTime } from './projectHelpers.js';

export const defaultMaterialFilters = {
  query: '',
  unit: 'all',
  status: 'all',
  onlyActive: false,
  sortBy: 'updatedAt',
};

export const defaultMaterialFormValues = {
  code: '',
  name: '',
  unit: '',
  isActive: true,
  observations: '',
};

export const materialUnitOptions = ['unidad', 'kg', 'm', 'm2', 'm3', 'litro', 'saco', 'caja'];

export function getMaterialStatusMeta(isActive) {
  return isActive
    ? { value: 'active', label: 'Vigente', tone: 'success' }
    : { value: 'inactive', label: 'Inactivo', tone: 'warning' };
}

export function filterMaterials(materials, filters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return materials.filter((material) => {
    const matchesQuery =
      !normalizedQuery ||
      material.code.toLowerCase().includes(normalizedQuery) ||
      material.name.toLowerCase().includes(normalizedQuery);

    const matchesUnit = filters.unit === 'all' || material.unit === filters.unit;
    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'active' && material.isActive) ||
      (filters.status === 'inactive' && !material.isActive);
    const matchesOnlyActive = !filters.onlyActive || material.isActive;

    return matchesQuery && matchesUnit && matchesStatus && matchesOnlyActive;
  });
}

export function sortMaterials(materials, sortBy) {
  const nextMaterials = [...materials];

  nextMaterials.sort((leftMaterial, rightMaterial) => {
    if (sortBy === 'code') {
      return leftMaterial.code.localeCompare(rightMaterial.code, 'es');
    }

    if (sortBy === 'name') {
      return leftMaterial.name.localeCompare(rightMaterial.name, 'es');
    }

    if (sortBy === 'createdAt') {
      return new Date(rightMaterial.createdAt).getTime() - new Date(leftMaterial.createdAt).getTime();
    }

    return new Date(rightMaterial.updatedAt).getTime() - new Date(leftMaterial.updatedAt).getTime();
  });

  return nextMaterials;
}

export function getMaterialSummary(materials) {
  const units = new Set();

  return materials.reduce(
    (summary, material) => {
      summary.total += 1;
      units.add(material.unit);

      if (material.isActive) {
        summary.active += 1;
      } else {
        summary.inactive += 1;
      }

      return summary;
    },
    { total: 0, active: 0, inactive: 0, unitDiversity: units.size, units }
  );
}

export function finalizeMaterialSummary(summary) {
  return {
    total: summary.total,
    active: summary.active,
    inactive: summary.inactive,
    unitDiversity: summary.units.size,
  };
}

export function getMaterialUnits(materials) {
  return Array.from(new Set(materials.map((material) => material.unit))).sort((leftUnit, rightUnit) => leftUnit.localeCompare(rightUnit, 'es'));
}

export function validateMaterialForm(values, materials, currentMaterialId = null) {
  const errors = {};
  const normalizedCode = values.code.trim().toLowerCase();
  const normalizedName = values.name.trim().toLowerCase();

  if (!normalizedCode) {
    errors.code = 'El código del material es obligatorio.';
  } else {
    const duplicateCode = materials.find(
      (material) => material.code.toLowerCase() === normalizedCode && material.id !== currentMaterialId
    );

    if (duplicateCode) {
      errors.code = 'Ya existe un material registrado con este código.';
    }
  }

  if (!normalizedName) {
    errors.name = 'El nombre del material es obligatorio.';
  } else {
    const duplicateName = materials.find(
      (material) => material.name.toLowerCase() === normalizedName && material.id !== currentMaterialId
    );

    if (duplicateName) {
      errors.name = 'Ya existe un material registrado con este nombre.';
    }
  }

  if (!values.unit.trim()) {
    errors.unit = 'Seleccione una unidad para continuar.';
  }

  return errors;
}

export function createMaterialPayload(values) {
  const timestamp = new Date().toISOString();

  return {
    id: `mat-${Date.now()}`,
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    unit: values.unit.trim(),
    isActive: values.isActive,
    observations: values.observations.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateMaterialPayload(material, values) {
  return {
    ...material,
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    unit: values.unit.trim(),
    isActive: values.isActive,
    observations: values.observations.trim(),
    updatedAt: new Date().toISOString(),
  };
}

export function updateMaterialStatusPayload(material, isActive) {
  return {
    ...material,
    isActive,
    updatedAt: new Date().toISOString(),
  };
}

export function formatMaterialDate(dateValue) {
  return formatDateTime(dateValue);
}