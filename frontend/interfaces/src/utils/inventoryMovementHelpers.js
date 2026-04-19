export const defaultInventoryMovementFilters = {
  query: '',
  movementType: 'all',
  materialId: 'all',
  dateWindow: 'all',
  alertsOnly: false,
};

export function formatMovementDate(dateValue) {
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

export function getMovementTypeMeta(movementType) {
  if (movementType === 'entry') {
    return { label: 'Entrada por recepción', tone: 'success' };
  }

  return { label: 'Salida por consumo', tone: 'warning' };
}

export function getStockStatusMeta(movement) {
  if (movement.alertType === 'insufficient-stock' || movement.stockResultante < 0) {
    return { label: 'Stock insuficiente', tone: 'danger' };
  }

  if (movement.alertType === 'excess') {
    return { label: 'Excedente detectado', tone: 'warning' };
  }

  return { label: 'Sin alerta', tone: 'success' };
}

export function getMovementOriginMeta(originType) {
  if (originType === 'reception') {
    return { label: 'Recepción relacionada', moduleId: 'inventory' };
  }

  if (originType === 'consumption') {
    return { label: 'Consumo relacionado', moduleId: 'consumption' };
  }

  if (originType === 'review') {
    return { label: 'Revisión relacionada', moduleId: 'review' };
  }

  return { label: 'Origen relacionado', moduleId: null };
}

export function getMaterialOptionsFromMovements(movements) {
  const materialMap = new Map();

  movements.forEach((movement) => {
    if (!materialMap.has(movement.materialId)) {
      materialMap.set(movement.materialId, {
        id: movement.materialId,
        code: movement.materialCode,
        name: movement.materialName,
      });
    }
  });

  return [...materialMap.values()];
}

function matchesDateWindow(dateValue, dateWindow) {
  if (dateWindow === 'all') {
    return true;
  }

  const movementDate = new Date(dateValue).getTime();
  const now = new Date('2026-04-11T23:00:00.000Z').getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  if (dateWindow === 'today') {
    return now - movementDate <= dayMs;
  }

  if (dateWindow === '7d') {
    return now - movementDate <= 7 * dayMs;
  }

  return true;
}

export function filterInventoryMovements(movements, filters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return movements.filter((movement) => {
    const matchesQuery =
      !normalizedQuery ||
      movement.materialCode.toLowerCase().includes(normalizedQuery) ||
      movement.materialName.toLowerCase().includes(normalizedQuery) ||
      movement.originReference.toLowerCase().includes(normalizedQuery);

    const matchesType = filters.movementType === 'all' || movement.movementType === filters.movementType;
    const matchesMaterial = filters.materialId === 'all' || movement.materialId === filters.materialId;
    const matchesDate = matchesDateWindow(movement.fechaMovimiento, filters.dateWindow);
    const matchesAlerts = !filters.alertsOnly || Boolean(movement.alertType);

    return matchesQuery && matchesType && matchesMaterial && matchesDate && matchesAlerts;
  });
}

export function sortInventoryMovements(movements) {
  return [...movements].sort((leftMovement, rightMovement) => new Date(rightMovement.fechaMovimiento).getTime() - new Date(leftMovement.fechaMovimiento).getTime());
}

export function getInventoryMovementSummary(movements, alerts) {
  return movements.reduce(
    (summary, movement) => {
      summary.total += 1;

      if (movement.movementType === 'entry') {
        summary.entries += 1;
      }

      if (movement.movementType === 'exit') {
        summary.exits += 1;
      }

      return summary;
    },
    { total: 0, entries: 0, exits: 0, activeAlerts: alerts.length }
  );
}