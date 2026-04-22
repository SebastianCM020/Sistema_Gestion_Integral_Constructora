import { formatQuantity } from './progressHelpers.js';

export function getBudgetValidation(rubro, quantityRaw) {
  if (!rubro) {
    return {
      status: 'idle',
      message: 'Seleccione un rubro para validar el presupuesto disponible.',
      remainingQuantity: null,
      utilization: 0,
      overrunQuantity: 0,
    };
  }

  const quantity = Number(quantityRaw);

  if (!quantityRaw) {
    return {
      status: 'idle',
      message: 'Ingrese la cantidad ejecutada para validar el presupuesto.',
      remainingQuantity: Math.max(rubro.budgetedQuantity - rubro.executedQuantity, 0),
      utilization: 0,
      overrunQuantity: 0,
    };
  }

  if (Number.isNaN(quantity) || quantity <= 0) {
    return {
      status: 'error',
      message: 'La cantidad debe ser numérica y mayor a cero.',
      remainingQuantity: Math.max(rubro.budgetedQuantity - rubro.executedQuantity, 0),
      utilization: 0,
      overrunQuantity: 0,
    };
  }

  const remainingQuantity = Math.max(rubro.budgetedQuantity - rubro.executedQuantity, 0);
  const nextExecutedQuantity = rubro.executedQuantity + quantity;
  const utilization = rubro.budgetedQuantity ? Math.min((nextExecutedQuantity / rubro.budgetedQuantity) * 100, 999) : 0;

  if (quantity > remainingQuantity) {
    return {
      status: 'block',
      message: `El avance ingresado supera el límite permitido. Solo quedan ${formatQuantity(remainingQuantity)} ${rubro.unit} disponibles para este rubro.`,
      remainingQuantity,
      utilization,
      overrunQuantity: quantity - remainingQuantity,
    };
  }

  if (remainingQuantity > 0 && (quantity >= remainingQuantity * 0.85 || utilization >= 95)) {
    return {
      status: 'warning',
      message: `El avance está cerca del límite presupuestario. Después del registro quedarán ${formatQuantity(remainingQuantity - quantity)} ${rubro.unit} disponibles.`,
      remainingQuantity,
      utilization,
      overrunQuantity: 0,
    };
  }

  return {
    status: 'ok',
    message: `El avance puede registrarse. Quedarán ${formatQuantity(remainingQuantity - quantity)} ${rubro.unit} disponibles dentro del presupuesto.`,
    remainingQuantity,
    utilization,
    overrunQuantity: 0,
  };
}