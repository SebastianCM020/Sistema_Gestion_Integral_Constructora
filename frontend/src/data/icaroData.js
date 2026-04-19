import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  Building2,
  Cable,
  ClipboardCheck,
  ClipboardList,
  FileSpreadsheet,
  FolderCog,
  HardHat,
  SlidersHorizontal,
  LayoutDashboard,
  PackageSearch,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Warehouse,
} from 'lucide-react';

export const moduleCatalog = [
  {
    id: 'administration',
    name: 'Administración',
    description: 'Gestione usuarios, permisos y parámetros críticos del sistema.',
    icon: UserCog,
    helperText: 'Mantenga la operación controlada por perfiles y accesos.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'projects',
    name: 'Proyectos y parametrización',
    description: 'Configure obras, etapas y datos base para la operación diaria.',
    icon: FolderCog,
    helperText: 'Centralice parámetros antes de abrir nuevos frentes de trabajo.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'rubros',
    name: 'Rubros y carga masiva',
    description: 'Administre rubros, plantillas y actualizaciones por lote.',
    icon: Building2,
    helperText: 'Evite reprocesos estandarizando catálogos y estructuras de costo.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'catalog',
    name: 'Catálogo y materiales',
    description: 'Mantenga referencias, unidades y materiales activos.',
    icon: Boxes,
    helperText: 'Actualice materiales críticos antes de compras o recepción.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'progress',
    name: 'Avance de obra',
    description: 'Registre hitos, rendimientos y novedades por frente.',
    icon: HardHat,
    helperText: 'Consolide avances diarios con soporte operativo claro.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'evidence',
    name: 'Evidencia y sincronización',
    description: 'Consolide soportes, fotos y cargas pendientes desde campo.',
    icon: Cable,
    helperText: 'Priorice sincronizaciones pendientes para no perder contexto.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'consumption',
    name: 'Consumo en obra',
    description: 'Controle consumos, salidas y movimientos por proyecto.',
    icon: PackageSearch,
    helperText: 'Detecte variaciones antes de afectar inventario o costos.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'requirements',
    name: 'Requerimientos de compra',
    description: 'Genere y envíe solicitudes a revisión con trazabilidad.',
    icon: ClipboardList,
    helperText: 'Agrupe necesidades frecuentes y evite solicitudes incompletas.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'review',
    name: 'Revisión de requerimientos',
    description: 'Valide solicitudes y decida aprobación según prioridades.',
    icon: ClipboardCheck,
    helperText: 'Revise observaciones antes de aprobar o devolver.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'inventory',
    name: 'Recepción e inventario',
    description: 'Reciba materiales y controle existencias de forma segura.',
    icon: Warehouse,
    helperText: 'Controle ingresos y diferencias antes del cierre del día.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'inventory-movements',
    name: 'Control de movimientos de inventario',
    description: 'Consulte entradas, salidas y alertas de stock por proyecto.',
    icon: ArrowLeftRight,
    helperText: 'Rastree origen, cantidad y stock resultante de cada movimiento.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'accounting',
    name: 'Consolidación y cierre contable',
    description: 'Prepare cierres, conciliaciones y seguimiento del periodo.',
    icon: ReceiptText,
    helperText: 'Verifique soportes antes de cerrar periodo o emitir planillas.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'payroll',
    name: 'Planillas y documentos de cobro',
    description: 'Genere, consulte y descargue planillas PDF por proyecto y periodo.',
    icon: FileSpreadsheet,
    helperText: 'Controle elegibilidad, cola de generación y descarga documental.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'reports',
    name: 'Reportes y dashboards',
    description: 'Consulte indicadores operativos, contables y ejecutivos.',
    icon: BarChart3,
    helperText: 'Priorice tableros por rol para tomar decisiones más rápido.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'audit',
    name: 'Auditoría y trazabilidad',
    description: 'Revise cambios críticos, accesos y eventos del sistema.',
    icon: ShieldCheck,
    helperText: 'Rastree eventos sensibles antes de cerrar incidencias.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'system-validations',
    name: 'Validaciones y control de acceso',
    description: 'Consulte estados de validacion, sesion, permisos y errores controlados.',
    icon: ShieldAlert,
    helperText: 'Centralice respuestas consistentes para validaciones, bloqueos y accesos.',
    statusLabel: 'Disponible para su rol',
  },
  {
    id: 'technical-settings',
    name: 'Configuración técnica general',
    description: 'Administre parametros globales, catalogos auxiliares y ajustes administrativos.',
    icon: SlidersHorizontal,
    helperText: 'Mantenga la configuracion central lista para validar, guardar y auditar.',
    statusLabel: 'Disponible para su rol',
  },
];

const roleCatalog = {
  admin: {
    label: 'Administrador del Sistema',
    orientation: 'Administre usuarios, permisos, parámetros y trazabilidad del sistema.',
    projectLabel: 'Portafolio corporativo de ICARO',
    moduleIds: ['administration', 'projects', 'rubros', 'catalog', 'audit', 'reports', 'system-validations', 'technical-settings'],
    quickActions: [
      { id: 'qa-admin-users', label: 'Administrar usuarios', description: 'Revise altas, bajas y permisos operativos.', icon: UserCog, actionType: 'module', moduleId: 'administration' },
      { id: 'qa-admin-project-access', label: 'Asignar acceso a proyectos', description: 'Controle vigencia y modo de acceso por usuario y proyecto.', icon: ShieldCheck, actionType: 'admin-view', adminSection: 'project-access' },
      { id: 'qa-admin-projects', label: 'Gestionar proyectos', description: 'Revise datos generales y parametrización operativa de cada proyecto.', icon: FolderCog, actionType: 'admin-view', adminSection: 'projects' },
      { id: 'qa-admin-rubros', label: 'Abrir rubros y carga masiva', description: 'Cree rubros manuales o valide importaciones CSV por proyecto.', icon: Building2, actionType: 'admin-view', adminSection: 'rubros' },
      { id: 'qa-admin-catalog', label: 'Abrir catálogo y materiales', description: 'Administre referencias, unidades y vigencia del catálogo base.', icon: Boxes, actionType: 'admin-view', adminSection: 'materials' },
      { id: 'qa-admin-technical-settings', label: 'Abrir configuración técnica', description: 'Revise parametros globales, catalogos auxiliares y ajustes administrativos.', icon: SlidersHorizontal, actionType: 'module', moduleId: 'technical-settings' },
      { id: 'qa-admin-audit', label: 'Revisar auditoría', description: 'Consulte eventos recientes y trazabilidad crítica.', icon: ShieldCheck, actionType: 'module', moduleId: 'audit' },
      { id: 'qa-admin-system-validations', label: 'Abrir validaciones', description: 'Revise estados de sesion, permisos y errores controlados.', icon: ShieldAlert, actionType: 'module', moduleId: 'system-validations' },
      { id: 'qa-admin-profile', label: 'Abrir perfil', description: 'Verifique su sesión y datos de acceso.', icon: LayoutDashboard, actionType: 'profile' },
    ],
    pendingItems: [
      { id: 'admin-pending-1', title: '5 usuarios pendientes de revisión de permisos', description: 'Confirme accesos antes del cierre operativo de hoy.', tone: 'warning', moduleId: 'administration', actionLabel: 'Revisar accesos' },
      { id: 'admin-pending-2', title: 'Catálogo con 2 materiales sin clasificación final', description: 'Evite errores en compras y consumo ajustando la parametrización.', tone: 'info', moduleId: 'catalog', actionLabel: 'Abrir catálogo' },
      { id: 'admin-pending-3', title: 'Actividad crítica detectada en auditoría', description: 'Se registraron cambios de permisos fuera del horario habitual.', tone: 'error', moduleId: 'audit', actionLabel: 'Ver trazabilidad' },
    ],
    recentActivity: [
      { id: 'admin-activity-1', title: 'Permisos actualizados para Auxiliar de Contabilidad', description: 'Proyecto Torre Norte', timeLabel: 'Hoy, 09:15 AM', moduleId: 'administration' },
      { id: 'admin-activity-2', title: 'Rubro reactivado para obras verticales', description: 'Carga masiva completada sin incidencias', timeLabel: 'Ayer, 05:42 PM', moduleId: 'rubros' },
    ],
  },
  executive: {
    label: 'Presidente / Gerente',
    orientation: 'Revise alertas ejecutivas, aprobaciones y resultados del periodo.',
    projectLabel: 'Resumen corporativo y obras priorizadas',
    moduleIds: ['review', 'reports', 'payroll', 'accounting'],
    quickActions: [
      { id: 'qa-exec-review', label: 'Revisar requerimientos', description: 'Valide solicitudes críticas antes de aprobar.', icon: ClipboardCheck, actionType: 'module', moduleId: 'review' },
      { id: 'qa-exec-reports', label: 'Abrir tableros', description: 'Consulte indicadores ejecutivos del periodo.', icon: BarChart3, actionType: 'module', moduleId: 'reports' },
      { id: 'qa-exec-payroll', label: 'Consultar planillas', description: 'Revise documentos listos para validación o descarga.', icon: FileSpreadsheet, actionType: 'module', moduleId: 'payroll' },
      { id: 'qa-exec-profile', label: 'Ir a mi perfil', description: 'Consulte sesión y accesos vigentes.', icon: LayoutDashboard, actionType: 'profile' },
    ],
    pendingItems: [
      { id: 'exec-pending-1', title: '3 requerimientos con prioridad ejecutiva', description: 'Pendientes de decisión para compra y avance de obra.', tone: 'warning', moduleId: 'review', actionLabel: 'Abrir revisión' },
      { id: 'exec-pending-2', title: 'Planillas del periodo listas para aprobación', description: 'Revise consolidado antes del cierre mensual.', tone: 'info', moduleId: 'payroll', actionLabel: 'Revisar documentos' },
    ],
    recentActivity: [
      { id: 'exec-activity-1', title: 'Dashboard ejecutivo consultado', description: 'Indicadores actualizados del periodo vigente', timeLabel: 'Hoy, 07:55 AM', moduleId: 'reports' },
      { id: 'exec-activity-2', title: 'Requerimiento aprobado con observaciones', description: 'Compra urgente para frente de estructura', timeLabel: 'Ayer, 04:20 PM', moduleId: 'review' },
    ],
  },
  accountant: {
    label: 'Contador',
    orientation: 'Revise cierres, planillas y pendientes del periodo contable.',
    projectLabel: 'Consolidado contable de obras activas',
    moduleIds: ['accounting', 'payroll', 'reports'],
    quickActions: [
      { id: 'qa-acc-close', label: 'Abrir cierre contable', description: 'Controle el avance del cierre mensual.', icon: ReceiptText, actionType: 'module', moduleId: 'accounting' },
      { id: 'qa-acc-payroll', label: 'Planillas y cobro', description: 'Genere, revise y descargue planillas del periodo.', icon: FileSpreadsheet, actionType: 'module', moduleId: 'payroll' },
      { id: 'qa-acc-reports', label: 'Consultar reportes', description: 'Valide cifras antes del corte del día.', icon: BarChart3, actionType: 'module', moduleId: 'reports' },
    ],
    pendingItems: [
      { id: 'acc-pending-1', title: 'Cierre mensual con 2 conciliaciones pendientes', description: 'Verifique soportes antes del envío definitivo.', tone: 'warning', moduleId: 'accounting', actionLabel: 'Revisar cierre' },
      { id: 'acc-pending-2', title: 'Planillas en proceso de validación', description: 'Una planilla requiere ajustes por inconsistencias menores.', tone: 'error', moduleId: 'payroll', actionLabel: 'Abrir documentos' },
    ],
    recentActivity: [],
  },
  assistant: {
    label: 'Auxiliar de Contabilidad',
    orientation: 'Atienda requerimientos, consultas operativas y soporte contable.',
    projectLabel: 'Apoyo contable y seguimiento operativo',
    moduleIds: ['requirements', 'accounting', 'reports'],
    quickActions: [
      { id: 'qa-asst-req', label: 'Crear requerimiento', description: 'Registre solicitudes para revisión contable.', icon: ClipboardList, actionType: 'module', moduleId: 'requirements' },
      { id: 'qa-asst-reports', label: 'Consultar reportes', description: 'Busque información operativa del periodo.', icon: BarChart3, actionType: 'module', moduleId: 'reports' },
      { id: 'qa-asst-profile', label: 'Abrir perfil', description: 'Confirme datos de sesión y soporte.', icon: LayoutDashboard, actionType: 'profile' },
    ],
    pendingItems: [],
    recentActivity: [
      { id: 'asst-activity-1', title: 'Consulta de soporte contable registrada', description: 'Proyecto Alameda Industrial', timeLabel: 'Hoy, 10:05 AM', moduleId: 'accounting' },
    ],
  },
  resident: {
    label: 'Residente',
    orientation: 'Revise avances, requerimientos y sincronización pendiente.',
    projectLabel: 'Complejo Residencial Altavista',
    moduleIds: ['progress', 'evidence', 'consumption', 'requirements', 'reports'],
    quickActions: [
      { id: 'qa-res-progress', label: 'Registrar avance', description: 'Actualice hitos y novedades del frente de obra.', icon: HardHat, actionType: 'module', moduleId: 'progress' },
      { id: 'qa-res-evidence', label: 'Sincronizar evidencia', description: 'Suba soportes pendientes desde campo.', icon: Cable, actionType: 'module', moduleId: 'evidence' },
      { id: 'qa-res-req', label: 'Crear requerimiento', description: 'Solicite materiales o apoyo operativo.', icon: ClipboardList, actionType: 'module', moduleId: 'requirements' },
      { id: 'qa-res-cons', label: 'Abrir consumo', description: 'Consulte consumos del día por frente.', icon: PackageSearch, actionType: 'module', moduleId: 'consumption' },
    ],
    pendingItems: [
      { id: 'res-pending-1', title: '2 sincronizaciones pendientes por baja conectividad', description: 'Suba soportes antes del cierre operativo de hoy.', tone: 'warning', moduleId: 'evidence', actionLabel: 'Abrir sincronización' },
      { id: 'res-pending-2', title: '1 requerimiento devuelto para corrección', description: 'Complete cantidades y justificación de consumo.', tone: 'error', moduleId: 'requirements', actionLabel: 'Corregir requerimiento' },
      { id: 'res-pending-3', title: 'Avance diario pendiente de cierre', description: 'Registre el frente de estructura antes de las 6:00 PM.', tone: 'info', moduleId: 'progress', actionLabel: 'Registrar avance' },
    ],
    recentActivity: [
      { id: 'res-activity-1', title: 'Avance registrado en Torre A', description: 'Vaciamiento de losa nivel 5', timeLabel: 'Hoy, 11:12 AM', moduleId: 'progress' },
      { id: 'res-activity-2', title: 'Evidencia sincronizada desde móvil', description: '12 archivos enviados correctamente', timeLabel: 'Hoy, 08:47 AM', moduleId: 'evidence' },
    ],
  },
  storekeeper: {
    label: 'Bodeguero',
    orientation: 'Controle recepción, inventario y alertas de stock del proyecto.',
    projectLabel: 'Bodega central de obra',
    moduleIds: ['inventory', 'inventory-movements', 'consumption', 'catalog'],
    quickActions: [
      { id: 'qa-store-inventory', label: 'Abrir inventario', description: 'Revise ingresos y salidas del día.', icon: Warehouse, actionType: 'module', moduleId: 'inventory' },
      { id: 'qa-store-movements', label: 'Controlar movimientos', description: 'Consulte trazabilidad y alertas del inventario.', icon: ArrowLeftRight, actionType: 'module', moduleId: 'inventory-movements' },
      { id: 'qa-store-consumption', label: 'Ver consumos', description: 'Consulte movimientos por frente y responsable.', icon: PackageSearch, actionType: 'module', moduleId: 'consumption' },
      { id: 'qa-store-catalog', label: 'Consultar materiales', description: 'Verifique referencias y unidades activas.', icon: Boxes, actionType: 'module', moduleId: 'catalog' },
    ],
    pendingItems: [
      { id: 'store-pending-1', title: 'Stock bajo en 4 materiales críticos', description: 'Revise existencias antes del despacho de la tarde.', tone: 'error', moduleId: 'inventory', actionLabel: 'Ver inventario' },
      { id: 'store-pending-2', title: 'Recepción parcial pendiente de validación', description: 'Faltan soportes de ingreso para una entrega programada.', tone: 'warning', moduleId: 'inventory', actionLabel: 'Validar recepción' },
      { id: 'store-pending-3', title: '2 alertas activas en movimientos recientes', description: 'Revise excedentes y consumos con stock insuficiente.', tone: 'warning', moduleId: 'inventory-movements', actionLabel: 'Abrir movimientos' },
    ],
    recentActivity: [
      { id: 'store-activity-1', title: 'Movimiento de salida registrado', description: 'Frente: mampostería bloque 2', timeLabel: 'Hoy, 09:40 AM', moduleId: 'inventory-movements' },
    ],
  },
};

const userCatalog = {
  'admin@icaro.com': { name: 'Ana Beltrán', email: 'admin@icaro.com', roleId: 'admin', status: 'Activo', lastAccess: 'Hoy, 07:48 AM' },
  'adminerror@icaro.com': { name: 'Ana Beltrán', email: 'adminerror@icaro.com', roleId: 'admin', status: 'Activo', lastAccess: 'Hoy, 07:48 AM', adminUsersShouldFail: true },
  'gerencia@icaro.com': { name: 'Laura Paredes', email: 'gerencia@icaro.com', roleId: 'executive', status: 'Activo', lastAccess: 'Hoy, 07:32 AM' },
  'contador@icaro.com': { name: 'Diego Rojas', email: 'contador@icaro.com', roleId: 'accountant', status: 'Activo', lastAccess: 'Hoy, 08:02 AM' },
  'auxiliar@icaro.com': { name: 'Sofía Marín', email: 'auxiliar@icaro.com', roleId: 'assistant', status: 'Activo', lastAccess: 'Hoy, 08:18 AM' },
  'residente@icaro.com': { name: 'Carlos Mendoza', email: 'residente@icaro.com', roleId: 'resident', status: 'Activo', lastAccess: 'Hoy, 08:30 AM' },
  'bodega@icaro.com': { name: 'Marta Gil', email: 'bodega@icaro.com', roleId: 'storekeeper', status: 'Activo', lastAccess: 'Hoy, 06:55 AM' },
  'panelerror@icaro.com': { name: 'Diego Rojas', email: 'panelerror@icaro.com', roleId: 'accountant', status: 'Activo', lastAccess: 'Hoy, 08:02 AM', dashboardShouldFail: true },
};

export const demoAccounts = [
  'admin@icaro.com',
  'adminerror@icaro.com',
  'gerencia@icaro.com',
  'contador@icaro.com',
  'auxiliar@icaro.com',
  'residente@icaro.com',
  'bodega@icaro.com',
  'panelerror@icaro.com',
];

function getRoleById(roleId) {
  return roleCatalog[roleId] ?? roleCatalog.resident;
}

function getUserInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((fragment) => fragment[0])
    .join('')
    .toUpperCase();
}

export function getUserFromEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const baseUser = userCatalog[normalizedEmail] ?? {
    name: 'Carlos Mendoza',
    email: normalizedEmail,
    roleId: 'resident',
    status: 'Activo',
    lastAccess: 'Primer acceso de hoy',
  };

  const role = getRoleById(baseUser.roleId);

  return {
    ...baseUser,
    roleName: role.label,
    roleOrientation: role.orientation,
    projectLabel: role.projectLabel,
    moduleIds: [...role.moduleIds],
    quickActions: [...role.quickActions],
    pendingItems: [...role.pendingItems],
    recentActivity: [...role.recentActivity],
    initials: getUserInitials(baseUser.name),
  };
}

export function getModulesForUser(user) {
  return moduleCatalog.filter((moduleItem) => user.moduleIds.includes(moduleItem.id));
}

export function getModuleById(moduleId) {
  return moduleCatalog.find((moduleItem) => moduleItem.id === moduleId) ?? null;
}