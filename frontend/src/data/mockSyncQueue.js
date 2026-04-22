export const mockSyncQueueByUser = {
  'residente@icaro.com': [
    {
      id: 'que-prg-pend-010',
      advanceId: 'prg-pend-010',
      projectId: 'prj-2003',
      projectCode: 'TOR-03',
      projectName: 'Torre Norte Empresarial',
      rubroCode: 'RB-101',
      rubroDescription: 'Excavación manual de zanja sanitaria',
      evidenceCount: 1,
      syncStatus: 'pending',
      lastAttemptAt: '2026-04-11T09:15:00.000Z',
      retryCount: 0,
      errors: [],
    },
    {
      id: 'que-prg-fail-014',
      advanceId: 'prg-fail-014',
      projectId: 'prj-2001',
      projectCode: 'ALT-01',
      projectName: 'Complejo Residencial Altavista',
      rubroCode: 'RB-020',
      rubroDescription: 'Pañete interior de muros',
      evidenceCount: 1,
      syncStatus: 'failed',
      lastAttemptAt: '2026-04-11T08:20:00.000Z',
      retryCount: 1,
      errors: ['No se pudo enviar la imagen por una inestabilidad temporal de red.'],
    },
  ],
};

export function getSyncQueueForUser(email) {
  return mockSyncQueueByUser[email?.trim().toLowerCase()] ?? [];
}