export const mockAuditComparisonsByEventId = {
  'aud-9001': {
    actor: {
      email: 'admin@icaro.com',
      role: 'Administrador del Sistema',
      sessionLabel: 'Sesion corporativa validada',
    },
    entity: {
      title: 'Permisos sensibles de usuario',
      subtitle: 'Perfil Auxiliar de Contabilidad',
      moduleLabel: 'Administracion',
      entityReference: 'usr-1004',
      projectReference: 'Sin proyecto',
    },
    request: {
      method: 'PATCH',
      endpoint: '/api/admin/users/usr-1004/permissions',
      originLabel: 'Panel de administracion',
      requestId: 'req-aud-9001',
      deviceLabel: 'Chrome 135 / Windows 11',
    },
    fieldChanges: [
      { field: 'permissions.audit', before: 'Sin acceso', after: 'Lectura parcial' },
      { field: 'permissions.reports', before: 'Lectura restringida', after: 'Lectura total' },
      { field: 'projectScope', before: 'ALT-01', after: 'ALT-01, TOR-03' },
    ],
  },
  'aud-9002': {
    actor: {
      email: 'admin@icaro.com',
      role: 'Administrador del Sistema',
      sessionLabel: 'Sesion corporativa validada',
    },
    entity: {
      title: 'Asignacion de acceso a proyecto',
      subtitle: 'TOR-03 · Torre Norte Empresarial',
      moduleLabel: 'Administracion',
      entityReference: 'acc-7781',
      projectReference: 'TOR-03',
    },
    request: {
      method: 'POST',
      endpoint: '/api/admin/project-access',
      originLabel: 'Panel de asignacion de proyectos',
      requestId: 'req-aud-9002',
      deviceLabel: 'Chrome 135 / Windows 11',
    },
    fieldChanges: [
      { field: 'accessMode', before: 'Sin acceso', after: 'billing-full' },
      { field: 'assignedTo', before: '-', after: 'usr-1003' },
      { field: 'validUntil', before: '-', after: '2026-11-30' },
    ],
  },
  'aud-9003': {
    actor: {
      email: 'contador@icaro.com',
      role: 'Contador',
      sessionLabel: 'Sesion de cierre contable',
    },
    entity: {
      title: 'Documento de cobro regenerado',
      subtitle: 'ALT-01 · Marzo 2026',
      moduleLabel: 'Planillas y documentos de cobro',
      entityReference: 'doc-pay-2026-03-alt01',
      projectReference: 'ALT-01',
    },
    request: {
      method: 'POST',
      endpoint: '/api/billing/documents/doc-pay-2026-03-alt01/regenerate',
      originLabel: 'Modulo planillas y documentos de cobro',
      requestId: 'req-aud-9003',
      deviceLabel: 'Edge 136 / Windows 11',
    },
    fieldChanges: [],
  },
  'aud-9004': {
    actor: {
      email: 'contador@icaro.com',
      role: 'Contador',
      sessionLabel: 'Sesion de cierre contable',
    },
    entity: {
      title: 'Cierre contable del periodo',
      subtitle: 'TOR-03 · Marzo 2026',
      moduleLabel: 'Consolidacion y cierre contable',
      entityReference: 'close-2026-03-tor03',
      projectReference: 'TOR-03',
    },
    request: {
      method: 'PATCH',
      endpoint: '/api/accounting/period-closes/close-2026-03-tor03',
      originLabel: 'Modulo consolidacion y cierre contable',
      requestId: 'req-aud-9004',
      deviceLabel: 'Edge 136 / Windows 11',
    },
    fieldChanges: [
      { field: 'status', before: 'Abierto', after: 'Cerrado' },
      { field: 'pendingConciliations', before: '3', after: '0' },
      { field: 'closureNote', before: 'Pendiente soporte factura 882', after: 'Cierre ejecutado con soportes validados' },
    ],
  },
  'aud-9005': {
    actor: {
      email: 'admin@icaro.com',
      role: 'Administrador del Sistema',
      sessionLabel: 'Sesion corporativa validada',
    },
    entity: {
      title: 'Parametro de cronograma',
      subtitle: 'TOR-03 · Torre Norte Empresarial',
      moduleLabel: 'Proyectos y parametrizacion',
      entityReference: 'param-903',
      projectReference: 'TOR-03',
    },
    request: {
      method: 'PATCH',
      endpoint: '/api/projects/prj-2003/parameters/param-903',
      originLabel: 'Modulo proyectos y parametrizacion',
      requestId: 'req-aud-9005',
      deviceLabel: 'Chrome 135 / Windows 11',
    },
    fieldChanges: [
      { field: 'targetDeliveryDate', before: '2026-10-14', after: '2026-10-28' },
      { field: 'approvalStatus', before: 'En revision', after: 'Aprobado' },
    ],
  },
  'aud-9006': {
    actor: {
      email: 'bodega@icaro.com',
      role: 'Bodeguero',
      sessionLabel: 'Sesion de operacion en bodega',
    },
    entity: {
      title: 'Recepcion de inventario',
      subtitle: 'ALT-01 · Complejo Residencial Altavista',
      moduleLabel: 'Recepcion e inventario',
      entityReference: 'rec-4478',
      projectReference: 'ALT-01',
    },
    request: {
      method: 'POST',
      endpoint: '/api/inventory/receptions',
      originLabel: 'Modulo recepcion e inventario',
      requestId: 'req-aud-9006',
      deviceLabel: 'Android WebView / Bodega',
    },
    fieldChanges: [],
  },
  'aud-9007': {
    actor: {
      email: 'gerencia@icaro.com',
      role: 'Presidente / Gerente',
      sessionLabel: 'Sesion ejecutiva validada',
    },
    entity: {
      title: 'Requerimiento de compra aprobado',
      subtitle: 'TOR-03 · Torre Norte Empresarial',
      moduleLabel: 'Revision de requerimientos',
      entityReference: 'req-buy-1220',
      projectReference: 'TOR-03',
    },
    request: {
      method: 'PATCH',
      endpoint: '/api/purchase-requests/req-buy-1220/approve',
      originLabel: 'Modulo revision de requerimientos',
      requestId: 'req-aud-9007',
      deviceLabel: 'Safari / iPad corporativo',
    },
    fieldChanges: [
      { field: 'status', before: 'Pendiente', after: 'Aprobado con observaciones' },
      { field: 'priority', before: 'Media', after: 'Alta' },
    ],
  },
  'aud-9008': {
    actor: {
      email: 'admin@icaro.com',
      role: 'Administrador del Sistema',
      sessionLabel: 'Sesion corporativa validada',
    },
    entity: {
      title: 'Acceso administrativo',
      subtitle: 'Evento de sesion',
      moduleLabel: 'Auditoria y trazabilidad',
      entityReference: 'ses-20260409-01',
      projectReference: 'Sin proyecto',
    },
    request: {
      method: 'POST',
      endpoint: '/api/auth/session',
      originLabel: 'Flujo de acceso y sesion',
      requestId: 'req-aud-9008',
      deviceLabel: 'Chrome 135 / Windows 11',
    },
    fieldChanges: [],
  },
  'aud-9009': {
    actor: {
      email: 'admin@icaro.com',
      role: 'Administrador del Sistema',
      sessionLabel: 'Sesion corporativa validada',
    },
    entity: {
      title: 'Cuenta de usuario desactivada',
      subtitle: 'Julian Serrano · Residente',
      moduleLabel: 'Administracion',
      entityReference: 'usr-1007',
      projectReference: 'Sin proyecto',
    },
    request: {
      method: 'DELETE',
      endpoint: '/api/admin/users/usr-1007',
      originLabel: 'Panel de administracion',
      requestId: 'req-aud-9009',
      deviceLabel: 'Chrome 135 / Windows 11',
    },
    fieldChanges: [
      { field: 'isActive', before: 'true', after: 'false' },
      { field: 'projectScope', before: 'Proyecto Alameda Industrial', after: 'Sin asignacion' },
      { field: 'lastAccessPolicy', before: 'Vigente', after: 'Acceso suspendido' },
    ],
  },
  'aud-9010': {
    actor: {
      email: 'admin@icaro.com',
      role: 'Administrador del Sistema',
      sessionLabel: 'Sesion corporativa validada',
    },
    entity: {
      title: 'Actualizacion de catalogo base',
      subtitle: 'Material de uso recurrente',
      moduleLabel: 'Catalogo y materiales',
      entityReference: 'mat-2205',
      projectReference: 'Sin proyecto',
    },
    request: {
      method: 'PATCH',
      endpoint: '/api/catalog/materials/mat-2205',
      originLabel: 'Modulo catalogo y materiales',
      requestId: 'req-aud-9010',
      deviceLabel: 'Chrome 135 / Windows 11',
    },
    fieldChanges: [
      { field: 'packagingUnit', before: 'Caja', after: 'Unidad' },
      { field: 'basePrice', before: '$ 14.200', after: '$ 14.950' },
    ],
  },
};

export function getAuditComparisonByEventId(eventId) {
  return mockAuditComparisonsByEventId[eventId] ?? null;
}