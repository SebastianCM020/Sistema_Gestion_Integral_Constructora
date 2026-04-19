export const mockPurchaseRequests = [
  {
    id: 'req-001',
    projectId: 'prj-2001',
    projectCode: 'ALT-01',
    projectName: 'Complejo Residencial Altavista',
    requesterId: 'residente@icaro.com',
    requesterName: 'Carlos Mendoza',
    requesterRole: 'Residente',
    justification: 'Se requiere reposición para continuar impermeabilización de cubierta del bloque 2 sin afectar el frente activo.',
    status: 'in-review',
    rejectionComment: '',
    requestedAt: '2026-04-11T08:40:00.000Z',
    approvedAt: null,
    createdAt: '2026-04-11T08:40:00.000Z',
    updatedAt: '2026-04-11T08:55:00.000Z',
    detail: [
      { materialId: 'cat-002', materialCode: 'MAT-ACR-014', materialName: 'Acrílico impermeabilizante flexible', unit: 'galón', requestedQuantity: 12 },
      { materialId: 'cat-005', materialCode: 'MAT-MAL-008', materialName: 'Malla electrosoldada 6 mm', unit: 'panel', requestedQuantity: 6 },
    ],
  },
  {
    id: 'req-002',
    projectId: 'prj-2003',
    projectCode: 'TOR-03',
    projectName: 'Torre Norte Empresarial',
    requesterId: 'auxiliar@icaro.com',
    requesterName: 'Sofía Marín',
    requesterRole: 'Auxiliar de Contabilidad',
    justification: 'Se consolida requerimiento para frente sanitario según novedades entregadas por residente y avance semanal.',
    status: 'approved',
    rejectionComment: '',
    requestedAt: '2026-04-10T15:10:00.000Z',
    approvedAt: '2026-04-10T17:35:00.000Z',
    createdAt: '2026-04-10T15:10:00.000Z',
    updatedAt: '2026-04-10T17:35:00.000Z',
    detail: [
      { materialId: 'cat-003', materialCode: 'MAT-TUB-021', materialName: 'Tubería sanitaria PVC 6 pulgadas', unit: 'tramo', requestedQuantity: 18 },
      { materialId: 'cat-004', materialCode: 'MAT-GEO-004', materialName: 'Geotextil no tejido 200 g', unit: 'rollo', requestedQuantity: 3 },
    ],
  },
  {
    id: 'req-003',
    projectId: 'prj-2001',
    projectCode: 'ALT-01',
    projectName: 'Complejo Residencial Altavista',
    requesterId: 'residente@icaro.com',
    requesterName: 'Carlos Mendoza',
    requesterRole: 'Residente',
    justification: 'Material solicitado para reposición de estructura liviana en cubierta técnica.',
    status: 'rejected',
    rejectionComment: 'La cantidad solicitada supera el presupuesto del frente. Ajuste cantidades y adjunte soporte técnico.',
    requestedAt: '2026-04-09T11:25:00.000Z',
    approvedAt: null,
    createdAt: '2026-04-09T11:25:00.000Z',
    updatedAt: '2026-04-09T14:20:00.000Z',
    detail: [
      { materialId: 'cat-005', materialCode: 'MAT-MAL-008', materialName: 'Malla electrosoldada 6 mm', unit: 'panel', requestedQuantity: 14 },
    ],
  },
  {
    id: 'req-004',
    projectId: 'prj-2003',
    projectCode: 'TOR-03',
    projectName: 'Torre Norte Empresarial',
    requesterId: 'auxiliar@icaro.com',
    requesterName: 'Sofía Marín',
    requesterRole: 'Auxiliar de Contabilidad',
    justification: 'Requerimiento consolidado recibido por compras y despacho programado para mañana.',
    status: 'received',
    rejectionComment: '',
    requestedAt: '2026-04-08T10:00:00.000Z',
    approvedAt: '2026-04-08T13:15:00.000Z',
    createdAt: '2026-04-08T10:00:00.000Z',
    updatedAt: '2026-04-08T16:40:00.000Z',
    detail: [
      { materialId: 'cat-003', materialCode: 'MAT-TUB-021', materialName: 'Tubería sanitaria PVC 6 pulgadas', unit: 'tramo', requestedQuantity: 10 },
    ],
  },
];

export function getPurchaseRequestsForUser(currentUser, accessibleProjectIds) {
  return mockPurchaseRequests.filter(
    (request) =>
      accessibleProjectIds.includes(request.projectId) &&
      (request.requesterId === currentUser.email || currentUser.roleName === 'Auxiliar de Contabilidad')
  );
}