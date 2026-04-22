export const mockReceptionHistoryByProject = {
  'prj-2001': [
    {
      id: 'rec-001',
      requestId: 'apr-003',
      requestCode: 'REQ-APR-2026-0407',
      projectId: 'prj-2001',
      projectCode: 'ALT-01',
      projectName: 'Complejo Residencial Altavista',
      receptionDate: '2026-04-07T15:25:00.000Z',
      receiverId: 'bodega@icaro.com',
      receiverName: 'Marta Gil',
      hasExcess: false,
      detail: [
        {
          materialId: 'mat-002',
          materialCode: 'MAT-ACR-014',
          materialName: 'Acrílico impermeabilizante flexible',
          unidad: 'galón',
          cantidadAprobada: 12,
          cantidadRecibida: 12,
          stockAnterior: 10,
          stockActualizado: 22,
        },
      ],
    },
  ],
  'prj-2003': [],
};

export function getReceptionHistoryByProject(projectId) {
  return (mockReceptionHistoryByProject[projectId] ?? []).map((item) => ({
    ...item,
    detail: item.detail.map((line) => ({ ...line })),
  }));
}