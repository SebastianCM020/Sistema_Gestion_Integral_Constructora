export const defaultInventoryFilters = {
  requestQuery: '',
  inventoryQuery: '',
};

export const emptyReceptionDraft = {
  requestId: '',
  lines: [],
};

export function formatInventoryDate(dateValue) {
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

export function getApprovedRequestMeta(status) {
  if (status === 'received') {
    return { label: 'Recepción registrada', tone: 'success' };
  }

  return { label: 'Aprobado disponible', tone: 'info' };
}

export function getInventoryStatusMeta(item) {
  if (item.availableQuantity <= 0) {
    return { label: 'Sin stock', tone: 'danger' };
  }

  if (item.availableQuantity <= item.minimumThreshold) {
    return { label: 'Stock bajo', tone: 'warning' };
  }

  if (item.syncStatus === 'pending') {
    return { label: 'Actualización pendiente', tone: 'warning' };
  }

  return { label: 'Disponible', tone: 'success' };
}

export function filterApprovedRequests(requests, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return requests;
  }

  return requests.filter(
    (request) =>
      request.requestCode.toLowerCase().includes(normalizedQuery) ||
      request.projectCode.toLowerCase().includes(normalizedQuery) ||
      request.requesterName.toLowerCase().includes(normalizedQuery)
  );
}

export function filterInventoryItems(items, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter(
    (item) =>
      item.code.toLowerCase().includes(normalizedQuery) ||
      item.name.toLowerCase().includes(normalizedQuery)
  );
}

export function getProjectInventorySummary(items, approvedRequests, receptionHistory) {
  return {
    approvedAvailable: approvedRequests.filter((request) => request.receptionStatus === 'available').length,
    lowStock: items.filter((item) => item.availableQuantity <= item.minimumThreshold).length,
    totalMaterials: items.length,
    lastReceptions: receptionHistory.length,
  };
}

export function buildReceptionDraftFromRequest(request) {
  return {
    requestId: request.requestId,
    lines: request.detail.map((line) => ({
      materialId: line.materialId,
      materialCode: line.materialCode,
      materialName: line.materialName,
      unidad: line.unidad,
      cantidadAprobada: line.cantidadAprobada,
      cantidadRecibida: line.cantidadRecibida ? String(line.cantidadRecibida) : '',
    })),
  };
}

export function getReceptionDeltaSummary(lines) {
  return lines.reduce(
    (summary, line) => {
      const received = Number(line.cantidadRecibida || 0);

      summary.totalApproved += Number(line.cantidadAprobada);
      summary.totalReceived += received;

      if (received > Number(line.cantidadAprobada)) {
        summary.excessCount += 1;
      }

      return summary;
    },
    { totalApproved: 0, totalReceived: 0, excessCount: 0 }
  );
}

export function hasReceptionChanges(draft) {
  return Boolean(
    draft.requestId ||
      draft.lines.some((line) => String(line.cantidadRecibida ?? '').trim() !== '')
  );
}

export function applyReceptionToInventory(inventoryItems, draftLines, requestId, receiver) {
  const receptionDate = new Date().toISOString();

  const updatedInventory = inventoryItems.map((item) => {
    const matchingLine = draftLines.find((line) => line.materialId === item.id || line.materialCode === item.code);

    if (!matchingLine) {
      return item;
    }

    return {
      ...item,
      availableQuantity: item.availableQuantity + Number(matchingLine.cantidadRecibida),
      lastUpdatedAt: receptionDate,
      syncStatus: 'pending',
    };
  });

  const receptionRecord = {
    id: `rec-${Date.now()}`,
    requestId,
    receptionDate,
    receiverId: receiver.email,
    receiverName: receiver.name,
    hasExcess: draftLines.some((line) => Number(line.cantidadRecibida) > Number(line.cantidadAprobada)),
    detail: draftLines.map((line) => {
      const inventoryItem = inventoryItems.find((item) => item.id === line.materialId || item.code === line.materialCode);
      const stockAnterior = inventoryItem?.availableQuantity ?? 0;
      const stockActualizado = stockAnterior + Number(line.cantidadRecibida);

      return {
        materialId: line.materialId,
        materialCode: line.materialCode,
        materialName: line.materialName,
        unidad: line.unidad,
        cantidadAprobada: Number(line.cantidadAprobada),
        cantidadRecibida: Number(line.cantidadRecibida),
        stockAnterior,
        stockActualizado,
      };
    }),
  };

  return { updatedInventory, receptionRecord };
}

export function markRequestAsReceived(requests, requestId, receivedLines) {
  return requests.map((request) => {
    if (request.requestId !== requestId) {
      return request;
    }

    return {
      ...request,
      receptionStatus: 'received',
      detail: request.detail.map((line) => {
        const matchingLine = receivedLines.find((receivedLine) => receivedLine.materialId === line.materialId);

        if (!matchingLine) {
          return line;
        }

        return {
          ...line,
          cantidadRecibida: Number(matchingLine.cantidadRecibida),
        };
      }),
    };
  });
}