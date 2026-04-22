export function validateReceptionDraft(draft) {
  const errors = {};
  const excessLines = [];

  if (!draft.requestId) {
    errors.requestId = 'Seleccione un requerimiento aprobado para continuar.';
  }

  if (!draft.lines.length) {
    errors.lines = 'No hay materiales disponibles para registrar recepción.';
    return { errors, excessLines };
  }

  const lineErrors = {};

  draft.lines.forEach((line) => {
    const numericValue = Number(line.cantidadRecibida);

    if (String(line.cantidadRecibida).trim() === '') {
      lineErrors[line.materialId] = 'Ingrese la cantidad recibida.';
      return;
    }

    if (Number.isNaN(numericValue)) {
      lineErrors[line.materialId] = 'La cantidad debe ser numérica.';
      return;
    }

    if (numericValue <= 0) {
      lineErrors[line.materialId] = 'La cantidad debe ser mayor a cero.';
      return;
    }

    if (numericValue > Number(line.cantidadAprobada)) {
      excessLines.push({
        materialId: line.materialId,
        materialCode: line.materialCode,
        materialName: line.materialName,
        cantidadAprobada: Number(line.cantidadAprobada),
        cantidadRecibida: numericValue,
      });
    }
  });

  if (Object.keys(lineErrors).length) {
    errors.lineErrors = lineErrors;
  }

  return { errors, excessLines };
}