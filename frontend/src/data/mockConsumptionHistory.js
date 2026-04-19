export const mockConsumptionHistoryByUser = {
  'residente@icaro.com': [
    {
      id: 'con-001',
      projectId: 'prj-2001',
      projectCode: 'ALT-01',
      projectName: 'Complejo Residencial Altavista',
      materialId: 'mat-001',
      materialCode: 'MAT-CEM-001',
      materialName: 'Cemento estructural Tipo UG',
      unit: 'bulto',
      quantityConsumed: 18,
      observations: 'Consumo aplicado al vaciado de placa del bloque 2.',
      registeredAt: '2026-04-11T08:20:00.000Z',
      status: 'registered',
      syncStatus: 'synced',
      syncTimestamp: '2026-04-11T08:28:00.000Z',
    },
    {
      id: 'con-002',
      projectId: 'prj-2003',
      projectCode: 'TOR-03',
      projectName: 'Torre Norte Empresarial',
      materialId: 'mat-102',
      materialCode: 'MAT-ARE-005',
      materialName: 'Arena lavada para relleno fino',
      unit: 'm3',
      quantityConsumed: 2,
      observations: 'Reposición de cama para tubería sanitaria.',
      registeredAt: '2026-04-11T09:10:00.000Z',
      status: 'registered',
      syncStatus: 'pending',
      syncTimestamp: null,
    },
  ],
};

export function getConsumptionHistoryForUser(email) {
  return mockConsumptionHistoryByUser[email?.trim().toLowerCase()] ?? [];
}