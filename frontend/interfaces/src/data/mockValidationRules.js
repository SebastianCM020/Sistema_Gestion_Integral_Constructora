export const validationFormDefaults = {
  requesterEmail: '',
  moduleId: '',
  projectCode: '',
  validUntil: '2026-05-15',
  justification: '',
};

export const validationModuleOptions = [
  { id: '', label: 'Seleccione un modulo' },
  { id: 'administration', label: 'Administracion' },
  { id: 'audit', label: 'Auditoria y trazabilidad' },
  { id: 'payroll', label: 'Planillas y documentos de cobro' },
  { id: 'reports', label: 'Reportes y dashboards' },
  { id: 'inventory', label: 'Recepcion e inventario' },
];

export const validationRuleCatalog = [
  {
    id: 'rule-1',
    field: 'requesterEmail',
    label: 'Correo corporativo',
    description: 'Debe tener formato valido y pertenecer a un dominio corporativo conocido.',
  },
  {
    id: 'rule-2',
    field: 'moduleId',
    label: 'Modulo de destino',
    description: 'Es obligatorio para determinar permisos, vigencia y contexto de la accion.',
  },
  {
    id: 'rule-3',
    field: 'projectCode',
    label: 'Proyecto o frente',
    description: 'Debe seguir el formato del sistema, por ejemplo ALT-01 o TOR-03.',
  },
  {
    id: 'rule-4',
    field: 'validUntil',
    label: 'Vigencia',
    description: 'La fecha no puede superar noventa dias respecto del contexto actual.',
  },
  {
    id: 'rule-5',
    field: 'justification',
    label: 'Justificacion',
    description: 'Debe explicar el motivo operativo o de control en al menos veinte caracteres.',
  },
];

export const permissionContextCatalog = [
  {
    id: 'perm-1',
    title: 'Acceso por rol',
    description: 'Administrador del Sistema puede abrir la vista de referencia y revisar todos los estados transversales.',
    roleLabel: 'Administrador del Sistema',
    scopeLabel: 'Modulo de sistema',
    validityLabel: 'Vigente durante la sesion activa',
    allowedActions: ['Consultar estados', 'Simular errores', 'Validar formularios'],
  },
  {
    id: 'perm-2',
    title: 'Restriccion por proyecto y vigencia',
    description: 'Las operaciones pueden bloquearse por proyecto, periodo o ventana de autorizacion.',
    roleLabel: 'Todos los roles',
    scopeLabel: 'Proyecto y fecha de vigencia',
    validityLabel: 'Segun politica activa del sistema',
    allowedActions: ['Reintentar', 'Volver al panel', 'Corregir datos'],
  },
];

export const validationExampleCatalog = [
  { id: 'permissions.role_denied', label: 'Acceso denegado', description: 'Muestra salida segura por permisos insuficientes.' },
  { id: 'auth.session_expired', label: 'Sesion expirada', description: 'Demuestra salida a reautenticacion o inicio seguro.' },
  { id: 'resource.not_found', label: 'Recurso no disponible', description: 'Explica cuando una referencia ya no esta disponible.' },
  { id: 'business.period_closed', label: 'Regla de negocio bloqueante', description: 'Representa cierres o restricciones operativas.' },
];