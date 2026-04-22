export const mockApprovedRequests = [
  {
    requestId: 'apr-001',
    requestCode: 'REQ-APR-2026-0411',
    projectId: 'prj-2001',
    projectCode: 'ALT-01',
    projectName: 'Complejo Residencial Altavista',
    requesterId: 'residente@icaro.com',
    requesterName: 'Carlos Mendoza',
    requesterRole: 'Residente',
    requestDate: '2026-04-10T09:20:00.000Z',
    approvedDate: '2026-04-10T15:10:00.000Z',
    approvalStatus: 'approved',
    receptionStatus: 'available',
    priority: 'high',
    detail: [
      {
        materialId: 'mat-001',
        materialCode: 'MAT-CEM-001',
        materialName: 'Cemento estructural Tipo UG',
        unidad: 'bulto',
        cantidadAprobada: 35,
        cantidadRecibida: 0,
      },
      {
        materialId: 'mat-003',
        materialCode: 'MAT-MAL-008',
        materialName: 'Malla electrosoldada 6 mm',
        unidad: 'panel',
        cantidadAprobada: 10,
        cantidadRecibida: 0,
      },
    ],
  },
  {
    requestId: 'apr-002',
    requestCode: 'REQ-APR-2026-0409',
    projectId: 'prj-2003',
    projectCode: 'TOR-03',
    projectName: 'Torre Norte Empresarial',
    requesterId: 'auxiliar@icaro.com',
    requesterName: 'Sofía Marín',
    requesterRole: 'Auxiliar de Contabilidad',
    requestDate: '2026-04-09T11:35:00.000Z',
    approvedDate: '2026-04-09T17:00:00.000Z',
    approvalStatus: 'approved',
    receptionStatus: 'available',
    priority: 'critical',
    detail: [
      {
        materialId: 'mat-101',
        materialCode: 'MAT-TUB-021',
        materialName: 'Tubería sanitaria PVC 6 pulgadas',
        unidad: 'tramo',
        cantidadAprobada: 14,
        cantidadRecibida: 0,
      },
      {
        materialId: 'mat-103',
        materialCode: 'MAT-GEO-004',
        materialName: 'Geotextil no tejido 200 g',
        unidad: 'rollo',
        cantidadAprobada: 3,
        cantidadRecibida: 0,
      },
    ],
  },
  {
    requestId: 'apr-003',
    requestCode: 'REQ-APR-2026-0407',
    projectId: 'prj-2001',
    projectCode: 'ALT-01',
    projectName: 'Complejo Residencial Altavista',
    requesterId: 'residente@icaro.com',
    requesterName: 'Carlos Mendoza',
    requesterRole: 'Residente',
    requestDate: '2026-04-07T08:45:00.000Z',
    approvedDate: '2026-04-07T12:05:00.000Z',
    approvalStatus: 'approved',
    receptionStatus: 'received',
    priority: 'normal',
    detail: [
      {
        materialId: 'mat-002',
        materialCode: 'MAT-ACR-014',
        materialName: 'Acrílico impermeabilizante flexible',
        unidad: 'galón',
        cantidadAprobada: 12,
        cantidadRecibida: 12,
      },
    ],
  },
];

export function getApprovedRequestsByProject(projectId) {
  return mockApprovedRequests
    .filter((request) => request.projectId === projectId)
    .map((request) => ({
      ...request,
      detail: request.detail.map((line) => ({ ...line })),
    }));
}