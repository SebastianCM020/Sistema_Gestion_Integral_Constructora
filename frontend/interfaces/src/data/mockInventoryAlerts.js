export const mockInventoryAlertsByProject = {
  'prj-2001': [
    {
      id: 'alert-001',
      projectId: 'prj-2001',
      projectCode: 'ALT-01',
      projectName: 'Complejo Residencial Altavista',
      materialId: 'mat-003',
      materialCode: 'MAT-MAL-008',
      materialName: 'Malla electrosoldada 6 mm',
      tipoAlerta: 'insufficient-stock',
      mensaje: 'Se detectó stock insuficiente después de una salida por consumo en obra.',
      severidad: 'critical',
      fecha: '2026-04-11T09:40:00.000Z',
      movementId: 'mov-003',
      originRelacion: {
        originType: 'consumption',
        originId: 'cons-441',
        originReference: 'CONS-2026-0411',
      },
    },
    {
      id: 'alert-002',
      projectId: 'prj-2001',
      projectCode: 'ALT-01',
      projectName: 'Complejo Residencial Altavista',
      materialId: 'mat-002',
      materialCode: 'MAT-ACR-014',
      materialName: 'Acrílico impermeabilizante flexible',
      tipoAlerta: 'excess',
      mensaje: 'Se detectó un excedente en la recepción registrada frente a lo aprobado.',
      severidad: 'warning',
      fecha: '2026-04-07T15:25:00.000Z',
      movementId: 'mov-004',
      originRelacion: {
        originType: 'reception',
        originId: 'apr-003',
        originReference: 'REQ-APR-2026-0407',
      },
    },
  ],
  'prj-2003': [],
};

export function getInventoryAlertsByProject(projectId) {
  return (mockInventoryAlertsByProject[projectId] ?? []).map((alert) => ({
    ...alert,
    originRelacion: { ...alert.originRelacion },
  }));
}