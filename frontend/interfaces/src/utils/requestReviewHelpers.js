export const defaultRequestReviewFilters = {
  query: '',
  estado: 'all',
  projectId: 'all',
  priority: 'all',
};

export function formatReviewDate(dateValue) {
  if (!dateValue) {
    return 'Sin fecha registrada';
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

export function getPriorityMeta(priority) {
  if (priority === 'critical') {
    return { label: 'Crítica', className: 'border-[#DC2626]/20 bg-[#FEE2E2] text-[#991B1B]' };
  }

  if (priority === 'high') {
    return { label: 'Alta', className: 'border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]' };
  }

  return { label: 'Normal', className: 'border-[#1F4E79]/20 bg-[#DCEAF7] text-[#1F4E79]' };
}

export function canReviewRequest(request) {
  return request.estado === 'in-review';
}

export function getReviewSummary(requests) {
  return requests.reduce(
    (summary, request) => {
      summary.total += 1;

      if (request.estado === 'in-review') {
        summary.pending += 1;
      }

      if (request.priority === 'critical' && request.estado === 'in-review') {
        summary.critical += 1;
      }

      if (request.estado === 'approved') {
        summary.approved += 1;
      }

      if (request.estado === 'rejected') {
        summary.rejected += 1;
      }

      return summary;
    },
    { total: 0, pending: 0, critical: 0, approved: 0, rejected: 0 }
  );
}

export function getProjectOptionsFromRequests(requests) {
  const seen = new Map();

  requests.forEach((request) => {
    if (!seen.has(request.projectId)) {
      seen.set(request.projectId, {
        id: request.projectId,
        code: request.projectCode,
        name: request.projectName,
      });
    }
  });

  return [...seen.values()];
}

export function filterRequests(requests, filters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return requests.filter((request) => {
    const matchesQuery =
      !normalizedQuery ||
      request.code.toLowerCase().includes(normalizedQuery) ||
      request.projectCode.toLowerCase().includes(normalizedQuery) ||
      request.projectName.toLowerCase().includes(normalizedQuery) ||
      request.requesterName.toLowerCase().includes(normalizedQuery);

    const matchesStatus = filters.estado === 'all' || request.estado === filters.estado;
    const matchesProject = filters.projectId === 'all' || request.projectId === filters.projectId;
    const matchesPriority = filters.priority === 'all' || request.priority === filters.priority;

    return matchesQuery && matchesStatus && matchesProject && matchesPriority;
  });
}

export function sortRequestsByUrgency(requests) {
  const priorityOrder = { critical: 0, high: 1, normal: 2 };

  return [...requests].sort((leftRequest, rightRequest) => {
    const priorityDelta = priorityOrder[leftRequest.priority] - priorityOrder[rightRequest.priority];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return new Date(rightRequest.fechaSolicitud).getTime() - new Date(leftRequest.fechaSolicitud).getTime();
  });
}

export function buildApprovePayload(request, reviewer) {
  const reviewDate = new Date().toISOString();

  return {
    ...request,
    estado: 'approved',
    comentarioRechazo: '',
    fechaRevision: reviewDate,
    reviewerId: reviewer.email,
    reviewerName: reviewer.name,
    timeline: [
      {
        id: `${request.id}-approved-${Date.now()}`,
        type: 'approved',
        title: 'Requerimiento aprobado',
        description: `${reviewer.name} aprobó el requerimiento y lo dejó listo para el siguiente estado del proceso.`,
        timestamp: reviewDate,
      },
      ...request.timeline,
    ],
  };
}

export function buildRejectPayload(request, reviewer, observation) {
  const reviewDate = new Date().toISOString();

  return {
    ...request,
    estado: 'rejected',
    comentarioRechazo: observation.trim(),
    fechaRevision: reviewDate,
    reviewerId: reviewer.email,
    reviewerName: reviewer.name,
    timeline: [
      {
        id: `${request.id}-rejected-${Date.now()}`,
        type: 'rejected',
        title: 'Requerimiento rechazado',
        description: `${reviewer.name} rechazó el requerimiento con observación para corrección.`,
        timestamp: reviewDate,
      },
      ...request.timeline,
    ],
  };
}

export function replaceRequest(requests, nextRequest) {
  return requests.map((request) => (request.id === nextRequest.id ? nextRequest : request));
}

export function getNextPendingRequest(requests, currentRequestId) {
  const pendingRequests = sortRequestsByUrgency(requests.filter((request) => request.estado === 'in-review'));
  const currentIndex = pendingRequests.findIndex((request) => request.id === currentRequestId);

  if (currentIndex >= 0 && currentIndex + 1 < pendingRequests.length) {
    return pendingRequests[currentIndex + 1];
  }

  return pendingRequests[0] ?? null;
}