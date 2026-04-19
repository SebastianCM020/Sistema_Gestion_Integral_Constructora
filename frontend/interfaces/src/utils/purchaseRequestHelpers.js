import { formatDateTime } from './projectHelpers.js';

export const defaultPurchaseRequestFilters = {
  query: '',
  status: 'all',
  sortBy: 'updatedAt',
};

export const defaultPurchaseRequestDraft = {
  projectId: '',
  justification: '',
  detail: [],
};

export const defaultRequestLineValues = {
  materialId: '',
  quantity: '',
};

export function getSelectedProject(projects, projectId) {
  return projects.find((project) => project.id === projectId) ?? null;
}

export function getAvailableCatalogMaterials(materials, projectId) {
  return materials.filter((material) => material.active && material.projectIds.includes(projectId));
}

export function filterCatalogMaterials(materials, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return materials;
  }

  return materials.filter(
    (material) =>
      material.code.toLowerCase().includes(normalizedQuery) ||
      material.name.toLowerCase().includes(normalizedQuery)
  );
}

export function getRequestStatusMeta(status) {
  if (status === 'approved') {
    return { label: 'Aprobado', tone: 'success' };
  }

  if (status === 'rejected') {
    return { label: 'Rechazado', tone: 'danger' };
  }

  if (status === 'received') {
    return { label: 'Recibido', tone: 'info' };
  }

  if (status === 'draft') {
    return { label: 'Borrador', tone: 'warning' };
  }

  return { label: 'En revisión', tone: 'warning' };
}

export function filterPurchaseRequests(requests, filters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return requests.filter((request) => {
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    const matchesQuery =
      !normalizedQuery ||
      request.id.toLowerCase().includes(normalizedQuery) ||
      request.projectCode.toLowerCase().includes(normalizedQuery) ||
      request.projectName.toLowerCase().includes(normalizedQuery) ||
      request.justification.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

export function sortPurchaseRequests(requests, sortBy) {
  const nextRequests = [...requests];

  nextRequests.sort((leftRequest, rightRequest) => {
    if (sortBy === 'requestedAt') {
      return new Date(rightRequest.requestedAt).getTime() - new Date(leftRequest.requestedAt).getTime();
    }

    if (sortBy === 'project') {
      return leftRequest.projectName.localeCompare(rightRequest.projectName, 'es');
    }

    return new Date(rightRequest.updatedAt).getTime() - new Date(leftRequest.updatedAt).getTime();
  });

  return nextRequests;
}

export function getPurchaseRequestSummary(requests) {
  return requests.reduce(
    (summary, request) => {
      summary.total += 1;

      if (request.status === 'in-review') {
        summary.inReview += 1;
      }

      if (request.status === 'approved') {
        summary.approved += 1;
      }

      if (request.status === 'rejected') {
        summary.rejected += 1;
      }

      return summary;
    },
    { total: 0, inReview: 0, approved: 0, rejected: 0 }
  );
}

export function validatePurchaseRequestDraft(draft) {
  const errors = {};

  if (!draft.projectId) {
    errors.projectId = 'Seleccione el proyecto para continuar.';
  }

  if (!draft.justification.trim()) {
    errors.justification = 'Ingrese la justificación del requerimiento.';
  }

  if (!draft.detail.length) {
    errors.detail = 'Agregue al menos un material al requerimiento.';
  }

  return errors;
}

export function validateRequestLine(values) {
  const errors = {};
  const numericQuantity = Number(values.quantity);

  if (!values.materialId) {
    errors.materialId = 'Seleccione un material válido del catálogo.';
  }

  if (!values.quantity) {
    errors.quantity = 'Ingrese la cantidad solicitada.';
  } else if (Number.isNaN(numericQuantity)) {
    errors.quantity = 'La cantidad debe ser numérica.';
  } else if (numericQuantity <= 0) {
    errors.quantity = 'La cantidad debe ser mayor a cero.';
  }

  return errors;
}

export function createRequestLinePayload(material, quantity) {
  return {
    id: `line-${Date.now()}-${material.id}`,
    materialId: material.id,
    materialCode: material.code,
    materialName: material.name,
    unit: material.unit,
    requestedQuantity: Number(quantity),
  };
}

export function upsertRequestLine(detail, linePayload, editingLineId = null) {
  if (editingLineId) {
    return detail.map((line) => (line.id === editingLineId ? { ...linePayload, id: editingLineId } : line));
  }

  return [...detail, linePayload];
}

export function removeRequestLine(detail, lineId) {
  return detail.filter((line) => line.id !== lineId);
}

export function hasDraftChanges(draft) {
  return Boolean(draft.projectId || draft.justification.trim() || draft.detail.length);
}

export function createPurchaseRequestPayload({ draft, project, currentUser }) {
  const timestamp = new Date().toISOString();

  return {
    id: `req-${Date.now()}`,
    projectId: project.id,
    projectCode: project.code,
    projectName: project.name,
    requesterId: currentUser.email,
    requesterName: currentUser.name,
    requesterRole: currentUser.roleName,
    justification: draft.justification.trim(),
    status: 'in-review',
    rejectionComment: '',
    requestedAt: timestamp,
    approvedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    detail: draft.detail.map((line) => ({
      materialId: line.materialId,
      materialCode: line.materialCode,
      materialName: line.materialName,
      unit: line.unit,
      requestedQuantity: Number(line.requestedQuantity),
    })),
  };
}

export function clearPurchaseRequestDraft(projectId = '') {
  return {
    ...defaultPurchaseRequestDraft,
    projectId,
    detail: [],
  };
}

export function getDraftSummary(detail) {
  return {
    totalLines: detail.length,
    totalUnits: detail.reduce((total, line) => total + Number(line.requestedQuantity), 0),
  };
}

export function formatRequestDate(dateValue) {
  return formatDateTime(dateValue);
}