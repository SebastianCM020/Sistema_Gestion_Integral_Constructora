export function getStockValidation(material, quantityRaw) {
  if (!material) {
    return {
      status: 'idle',
      message: 'Seleccione un material para validar el stock disponible.',
      availableQuantity: 0,
      remainingQuantity: 0,
      requestedQuantity: 0,
    };
  }

  if (!quantityRaw) {
    return {
      status: 'idle',
      message: 'Ingrese la cantidad consumida para validar el stock.',
      availableQuantity: material.availableQuantity,
      remainingQuantity: material.availableQuantity,
      requestedQuantity: 0,
    };
  }

  const requestedQuantity = Number(quantityRaw);

  if (Number.isNaN(requestedQuantity)) {
    return {
      status: 'error',
      message: 'La cantidad consumida debe ser numérica.',
      availableQuantity: material.availableQuantity,
      remainingQuantity: material.availableQuantity,
      requestedQuantity: 0,
    };
  }

  if (requestedQuantity <= 0) {
    return {
      status: 'error',
      message: 'La cantidad consumida debe ser mayor a cero.',
      availableQuantity: material.availableQuantity,
      remainingQuantity: material.availableQuantity,
      requestedQuantity,
    };
  }

  if (requestedQuantity > material.availableQuantity) {
    return {
      status: 'block',
      message: `La cantidad ingresada supera el stock disponible. Solo hay ${material.availableQuantity} ${material.unit} disponibles para este material.`,
      availableQuantity: material.availableQuantity,
      remainingQuantity: 0,
      requestedQuantity,
      shortageQuantity: requestedQuantity - material.availableQuantity,
    };
  }

  const remainingQuantity = material.availableQuantity - requestedQuantity;
  const warningThreshold = Math.max(material.minimumThreshold ?? 0, material.availableQuantity * 0.2);

  if (remainingQuantity <= warningThreshold) {
    return {
      status: 'warning',
      message: `El consumo puede registrarse, pero el stock quedará en ${remainingQuantity} ${material.unit}. Revise si requiere reposición.`,
      availableQuantity: material.availableQuantity,
      remainingQuantity,
      requestedQuantity,
    };
  }

  return {
    status: 'ok',
    message: `El stock es suficiente. Después del registro quedarán ${remainingQuantity} ${material.unit} disponibles.`,
    availableQuantity: material.availableQuantity,
    remainingQuantity,
    requestedQuantity,
  };
}