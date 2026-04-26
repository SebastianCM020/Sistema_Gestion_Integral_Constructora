/**
 * Generador del documento:
 * Analisis_Inconsistencias_Sistema_Gestion_Integral_Constructora.docx
 * 
 * Usa: npm package "docx" v9.x
 * Ejecutar: node generate_analysis.js
 */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  PageBreak, VerticalAlign, TableLayoutType, LevelFormat, convertInchesToTwip,
  Header, Footer, PageNumber, NumberFormat, UnderlineType
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── Helpers de estilo ────────────────────────────────────────────────────────

const COLORS = {
  primary:   '1F3864',   // Azul oscuro ESPOCH
  accent:    '2E74B5',   // Azul medio
  red:       'C00000',
  orange:    'ED7D31',
  yellow:    'FFC000',
  green:     '375623',
  lightBlue: 'BDD7EE',
  lightGray: 'F2F2F2',
  gray:      'D9D9D9',
  darkGray:  '595959',
  white:     'FFFFFF',
  tablHead:  '1F3864',
  rowAlt:    'EFF3FB',
  critRed:   'FFCCCC',
  critOrange:'FFE5CC',
  critYellow:'FFFACC',
  critGreen: 'CCFFCC',
};

const font = 'Calibri';

/** Párrafo de texto body normal */
function bodyPara(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 160, line: 276 },
    children: [new TextRun({
      text,
      font,
      size: 22,   // 11pt
      bold:    opts.bold    || false,
      italics: opts.italic  || false,
      color:   opts.color   || '000000',
    })],
  });
}

/** Párrafo vacío (espaciador) */
function spacer(size = 100) {
  return new Paragraph({ spacing: { after: size } });
}

/** Heading 1 */
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    children: [new TextRun({
      text,
      font,
      size: 32,   // 16pt
      bold: true,
      color: COLORS.primary,
      allCaps: true,
    })],
    border: { bottom: { color: COLORS.accent, size: 8, style: BorderStyle.SINGLE } },
  });
}

/** Heading 2 */
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({
      text,
      font,
      size: 26,   // 13pt
      bold: true,
      color: COLORS.accent,
    })],
  });
}

/** Heading 3 */
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({
      text,
      font,
      size: 24,   // 12pt
      bold: true,
      italics: true,
      color: COLORS.darkGray,
    })],
  });
}

/** Bullet point */
function bullet(text, opts = {}) {
  return new Paragraph({
    bullet: { level: opts.level || 0 },
    spacing: { after: 100 },
    children: [new TextRun({
      text,
      font,
      size: 22,
      bold:   opts.bold   || false,
      italics: opts.italic || false,
    })],
  });
}

/** Celda de tabla genérica */
function tc(text, opts = {}) {
  const shading = opts.bg
    ? { type: ShadingType.CLEAR, color: 'auto', fill: opts.bg }
    : undefined;
  return new TableCell({
    width:        opts.width  ? { size: opts.width,  type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    shading,
    columnSpan:  opts.span  || 1,
    children: [new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing:   { after: 80, before: 80 },
      children: [new TextRun({
        text,
        font,
        size:   opts.size   || 20,
        bold:   opts.bold   || false,
        italics: opts.italic || false,
        color:  opts.color  || '000000',
      })],
    })],
  });
}

/** Fila de encabezado de tabla (fondo azul oscuro, texto blanco) */
function headerRow(cols) {
  return new TableRow({
    tableHeader: true,
    children: cols.map(({ text, width, span }) =>
      tc(text, { bg: COLORS.tablHead, bold: true, color: COLORS.white, center: true, size: 20, width, span })
    ),
  });
}

/** Fila de datos alternada */
function dataRow(cells, idx = 0) {
  const bg = idx % 2 === 0 ? COLORS.white : COLORS.rowAlt;
  return new TableRow({
    children: cells.map(({ text, bold, italic, center, width, color, bg: cellBg }) =>
      tc(text, { bg: cellBg || bg, bold, italic, center, width, color })
    ),
  });
}

// ─── Tabla de inventario documental ──────────────────────────────────────────
function buildInventoryTable() {
  const docs = [
    ['DOC-01', 'ALCANCE DE UN PROYECTO.pdf', 'PDF', 'Definición del alcance, dominios excluidos y fases del proyecto', 'Alta'],
    ['DOC-02', 'IT-AN-1a Anteproyecto_Trabajo_de_Titulacion_Proyecto_Tecnico_FIE.pdf', 'PDF', 'Objetivos, metodología SCRUM, instrumentos académicos', 'Alta'],
    ['DOC-03', 'SRS / Especificación de Requisitos del Sistema', 'PDF/DOCX', 'Requisitos funcionales y no funcionales, actores, restricciones', 'Alta'],
    ['DOC-04', 'Especificación de Casos de Uso', 'PDF', 'Flujos de negocio por actor, pre-condiciones, post-condiciones', 'Alta'],
    ['DOC-05', 'Historias técnicas', 'PDF/MD', 'Capacidades técnicas, módulos, criterios de aceptación', 'Alta'],
    ['DOC-06', 'Plan_Pruebas_Verificacion_Validacion_Integracion_ICARO.docx', 'DOCX', 'Plan integral de pruebas: verificación, validación e integración', 'Alta'],
    ['DOC-07', 'Informe_Ejecucion_Plan_Pruebas_Verificacion_Validacion_Integracion_ICARO_v3.docx', 'DOCX', 'Informe de ejecución y constatación del prototipo frontend', 'Alta'],
    ['DOC-08', 'Matrices_Plan_Pruebas_ICARO.xlsx', 'XLSX', 'Matrices de trazabilidad y catálogo de casos de prueba', 'Alta'],
    ['DOC-09', 'arquitectura_sistema_icaro.md', 'MD', 'Diseño arquitectónico: layered monolith, patrones RBAC/JWT, Docker', 'Alta'],
    ['DOC-10', 'sprint_semana2_implementacion.md', 'MD', 'Implementación sprint semana 2: RBAC, auditoría, gestión usuarios, pruebas', 'Alta'],
    ['DOC-11', 'Analisis_Inconsistencias_Historias_Usuario.pdf', 'PDF (pivote)', 'Documento base de referencia para el presente análisis', 'Crítica'],
    ['DOC-12', 'Matrices_Trazabilidad_ICARO.xlsx', 'XLSX', 'Matrices adicionales de trazabilidad del proyecto', 'Alta'],
    ['DOC-13', 'base.sql / schema.prisma', 'SQL/Prisma', 'Esquema de base de datos relacional con 14 modelos ORM', 'Media'],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      headerRow([
        { text: 'ID', width: 7 },
        { text: 'Documento', width: 30 },
        { text: 'Tipo', width: 9 },
        { text: 'Contenido / Propósito', width: 40 },
        { text: 'Relevancia', width: 14 },
      ]),
      ...docs.map((d, i) => dataRow([
        { text: d[0], bold: true, center: true },
        { text: d[1], italic: true },
        { text: d[2], center: true },
        { text: d[3] },
        { text: d[4], center: true, bold: d[4] === 'Crítica', color: d[4] === 'Crítica' ? COLORS.red : '000000' },
      ], i))
    ],
  });
}

// ─── Tabla de inconsistencias consolidada ────────────────────────────────────
function buildInconsistencyTable() {
  const rows = [
    // ID, Categoría, Descripción breve, Doc origen, Doc destino, Severidad, Estado
    ['INC-ALC-01', 'Alcance', 'La gestión documental avanzada aparece incluida en historias de usuario pero explícitamente excluida en el documento de alcance, generando ambigüedad sobre si el módulo debe implementarse.', 'DOC-11 (H.U.)', 'DOC-01 (Alcance)', 'Crítica', 'Abierta'],
    ['INC-ALC-02', 'Alcance', 'El alcance define un sistema web y móvil plenamente integrado, pero el backend operativo solo implementa los módulos de autenticación y usuarios; las rutas de avances, compras e inventario están comentadas en server.js.', 'DOC-01 (Alcance)', 'DOC-10 (Sprint 2)', 'Crítica', 'Abierta'],
    ['INC-RF-01', 'Req. Funcional', 'La generación de planillas PDF (CierreMensual → PlanillaPdf) es un proceso crítico con modelo propio en Prisma, pero en algunos documentos es tratada como un sub-reporte secundario en lugar de un módulo funcional independiente.', 'DOC-03 (SRS)', 'DOC-11 (H.U.)', 'Alta', 'Abierta'],
    ['INC-RNF-01', 'Req. No Funcional', 'Los RNF definen métricas medibles (P95 < 2000 ms, SUS > 75, disponibilidad > 99 %, RBAC auditado), pero el Informe de Ejecución no presenta evidencia de medición de dichos atributos; la validación SUS y el test de performance quedan pendientes.', 'DOC-03 (SRS)', 'DOC-07 (Informe)', 'Alta', 'Abierta'],
    ['INC-HU-01', 'Historias de Usuario', 'La historia de usuario sobre modo offline/sincronización del módulo móvil (obra en campo) está contemplada en el alcance como atributo de disponibilidad, pero los componentes frontend carecen de implementación de cola local / estrategia de reintento real.', 'DOC-11 (H.U.)', 'DOC-09 (Arq.)', 'Alta', 'Abierta'],
    ['INC-ARQ-01', 'Arquitectura', 'El StorageService (almacenamiento de evidencias fotográficas) aparece mencionado en el sprint y el esquema (EvidenciaFotografica), pero no está explícitamente modelado como componente de servicio en el diagrama de arquitectura del backend.', 'DOC-09 (Arq.)', 'DOC-10 (Sprint 2)', 'Alta', 'Abierta'],
    ['INC-ARQ-02', 'Arquitectura', 'El QueueService para generación asíncrona de planillas PDF (PlanillaPdf) es referenciado en el diseño de flujo de cierre contable, pero no figura en el diagrama de componentes de backend ni en el docker-compose como servicio autónomo.', 'DOC-09 (Arq.)', 'DOC-03 (SRS)', 'Alta', 'Abierta'],
    ['INC-ARQ-03', 'Arquitectura', 'La arquitectura móvil (PWA / campo) requiere Local Cache + Sync Manager según los atributos de disponibilidad, pero no existe un diagrama explícito de la capa offline en los documentos de arquitectura, ni módulos constatables en el frontend.', 'DOC-09 (Arq.)', 'DOC-11 (H.U.)', 'Crítica', 'Abierta'],
    ['INC-PRU-01', 'Pruebas', 'El Plan de Pruebas contempla pruebas de integración real con backend (API calls, persistencia, notificaciones), pero el Informe de Ejecución constata que el frontend opera exclusivamente con datos mock y no evidencia consumo real de API.', 'DOC-06 (Plan)', 'DOC-07 (Informe)', 'Alta', 'Abierta'],
    ['INC-PRU-02', 'Pruebas', 'El Plan de Pruebas establece la aplicación del cuestionario SUS (System Usability Scale) como criterio de validación de usabilidad (SUS > 75), pero el Informe de Ejecución no incluye resultados SUS ni evidencia de su aplicación con usuarios reales.', 'DOC-06 (Plan)', 'DOC-07 (Informe)', 'Alta', 'Abierta'],
    ['INC-PRU-03', 'Pruebas', 'El backend contiene una suite de 15 pruebas automatizadas (security.test.js) con Jest + Supertest que cubre RBAC, JWT y control de acceso. Sin embargo, el Informe de Ejecución señala "no se encontraron archivos específicos de pruebas del proyecto", omitiendo estas evidencias técnicas ya existentes.', 'DOC-07 (Informe)', 'DOC-10 (Sprint 2)', 'Alta', 'Abierta'],
    ['INC-AUD-01', 'Auditoría', 'El servicio audit.service.js y el modelo AuditLog implementan la trazabilidad a nivel de aplicación, pero no existen triggers de base de datos (BEFORE UPDATE/DELETE) ni permisos REVOKE sobre la tabla audit_log para garantizar inmutabilidad a nivel de motor PostgreSQL.', 'DOC-09 (Arq.)', 'DOC-10 (Sprint 2)', 'Media', 'Abierta'],
    ['INC-ROL-01', 'Roles / RBAC', 'El endpoint GET /api/v1/users/roles está implementado y expuesto en el backend, pero AdminUsersPermissionsView.jsx y los modales de usuario cargan los roles desde el array estático availableRoles de mockUsers.js, sin invocar la API dinámica correspondiente.', 'DOC-10 (Sprint 2)', 'DOC-07 (Informe)', 'Alta', 'Abierta'],
    ['INC-FOR-01', 'Formato / Redacción', 'Se detectan errores tipográficos recurrentes: "Phyton" en lugar de "Python"; "Microsoft Proyect" en lugar de "Microsoft Project". Estos errores afectan la credibilidad académica del documento.', 'DOC-07 (Informe)', 'DOC-06 (Plan)', 'Baja', 'Abierta'],
    ['INC-FOR-02', 'Formato / Nomenclatura', 'El nombre comercial de la empresa aparece con variantes inconsistentes a lo largo de los documentos: "ICAROCONSTRUCTORES", "ICARO CONSTRUCTORES", "ICARO CONSTRUCTORES BMGM" y "ICARO CONSTRUCTORES BMGM S.A.S.", sin uniformidad en el uso de la denominación oficial.', 'DOC-06 (Plan)', 'DOC-07 (Informe)', 'Media', 'Abierta'],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow([
        { text: 'ID', width: 8 },
        { text: 'Categoría', width: 10 },
        { text: 'Descripción', width: 36 },
        { text: 'Doc. Origen', width: 11 },
        { text: 'Doc. Destino', width: 11 },
        { text: 'Severidad', width: 10 },
        { text: 'Estado', width: 8 },
      ]),
      ...rows.map((r, i) => {
        const sevColors = {
          'Crítica': COLORS.critRed,
          'Alta':    COLORS.critOrange,
          'Media':   COLORS.critYellow,
          'Baja':    COLORS.critGreen,
        };
        return new TableRow({
          children: [
            tc(r[0], { bg: i % 2 === 0 ? COLORS.white : COLORS.rowAlt, bold: true, size: 18 }),
            tc(r[1], { bg: i % 2 === 0 ? COLORS.white : COLORS.rowAlt, italic: true, size: 18 }),
            tc(r[2], { bg: i % 2 === 0 ? COLORS.white : COLORS.rowAlt, size: 18 }),
            tc(r[3], { bg: i % 2 === 0 ? COLORS.white : COLORS.rowAlt, size: 18, center: true }),
            tc(r[4], { bg: i % 2 === 0 ? COLORS.white : COLORS.rowAlt, size: 18, center: true }),
            tc(r[5], { bg: sevColors[r[5]], bold: true, size: 18, center: true }),
            tc(r[6], { bg: i % 2 === 0 ? COLORS.white : COLORS.rowAlt, size: 18, center: true }),
          ]
        });
      })
    ],
  });
}

// ─── Tabla de criterios de severidad ─────────────────────────────────────────
function buildSeverityTable() {
  const levels = [
    ['Crítica', COLORS.critRed, 'Compromete la coherencia, el alcance o la seguridad del sistema. Requiere corrección inmediata antes de continuar el proyecto.'],
    ['Alta',    COLORS.critOrange, 'Afecta la funcionalidad, la integración o la trazabilidad de forma relevante. Debe corregirse en el próximo sprint.'],
    ['Media',   COLORS.critYellow, 'Inconsistencia significativa que no bloquea el avance pero genera riesgo técnico o de calidad si no se atiende.'],
    ['Baja',    COLORS.critGreen, 'Error menor de redacción, nomenclatura o formato. No impacta el comportamiento del sistema pero afecta la presentación académica.'],
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow([
        { text: 'Nivel de Severidad', width: 15 },
        { text: 'Criterio de Clasificación', width: 85 },
      ]),
      ...levels.map((l, i) => new TableRow({
        children: [
          tc(l[0], { bg: l[1], bold: true, center: true }),
          tc(l[2], { bg: i % 2 === 0 ? COLORS.white : COLORS.rowAlt }),
        ]
      }))
    ]
  });
}

// ─── Tabla de plan de acción ──────────────────────────────────────────────────
function buildActionPlanTable() {
  const actions = [
    ['ACC-01', 'INC-ALC-01, INC-ALC-02', 'Definir formalmente en el documento de alcance qué módulos están incluidos en la iteración actual y cuáles son backlog futuro. Habilitar rutas comentadas en server.js.', '1 semana', 'Isaac Castro / Ivan Pulgar', 'No iniciada'],
    ['ACC-02', 'INC-ARQ-03, INC-ARQ-01', 'Agregar en el documento de arquitectura un diagrama explícito de la capa offline (Local Cache + Sync Manager). Documentar StorageService como componente de servicio.', '1 semana', 'Ivan Pulgar', 'No iniciada'],
    ['ACC-03', 'INC-PRU-01, INC-PRU-03', 'Generar evidencias del backend operativo con Docker Compose. Completar el Informe añadiendo la sección de pruebas automatizadas (security.test.js, 15/15 tests).', '1 semana', 'Ivan Pulgar', 'No iniciada'],
    ['ACC-04', 'INC-RF-01', 'Elevar la generación de planillas PDF a módulo funcional explícito en el SRS y en el mapa de módulos del Plan de Pruebas.', '3 días', 'Isaac Castro', 'No iniciada'],
    ['ACC-05', 'INC-RNF-01', 'Ejecutar medición formal de usabilidad (cuestionario SUS con usuarios reales) y prueba de rendimiento (P95 < 2000 ms). Documentar resultados en el Informe.', '2 semanas', 'Ambos autores', 'No iniciada'],
    ['ACC-06', 'INC-ROL-01', 'Reemplazar availableRoles estático en AdminUsersPermissionsView.jsx y modales por llamada real a usersApi.getRoles(). Verificar con prueba de integración.', '2 días', 'Ivan Pulgar', 'No iniciada'],
    ['ACC-07', 'INC-AUD-01', 'Agregar trigger BEFORE UPDATE/DELETE sobre audit_log en la migración de PostgreSQL, y documentar la estrategia de inmutabilidad en el documento de arquitectura.', '2 días', 'Ivan Pulgar', 'No iniciada'],
    ['ACC-08', 'INC-PRU-02', 'Aplicar cuestionario SUS con al menos 5 usuarios representativos, tabular resultados e incluirlos en el Informe como evidencia de validación de usabilidad.', '2 semanas', 'Ambos autores', 'No iniciada'],
    ['ACC-09', 'INC-ARQ-02, INC-HU-01', 'Diseñar e implementar QueueService para generación PDF y Local Cache para modo offline. Reflejar ambos en docker-compose y en el diagrama de arquitectura.', '2 semanas', 'Ambos autores', 'No iniciada'],
    ['ACC-10', 'INC-FOR-01, INC-FOR-02', 'Realizar revisión ortográfica de todos los documentos. Unificar la denominación de la empresa como "ICARO CONSTRUCTORES BMGM S.A.S." en todos los encabezados.', '1 día', 'Ambos autores', 'No iniciada'],
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow([
        { text: 'ID Acción', width: 8 },
        { text: 'INC Relacionadas', width: 14 },
        { text: 'Acción a ejecutar', width: 38 },
        { text: 'Plazo', width: 10 },
        { text: 'Responsable', width: 16 },
        { text: 'Estado', width: 14 },
      ]),
      ...actions.map((a, i) => dataRow([
        { text: a[0], bold: true, center: true },
        { text: a[1], italic: true, center: true },
        { text: a[2] },
        { text: a[3], center: true },
        { text: a[4] },
        { text: a[5], center: true },
      ], i))
    ]
  });
}

// ─── Tabla control documental ─────────────────────────────────────────────────
function buildVersionTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow([
        { text: 'Versión', width: 10 },
        { text: 'Fecha', width: 15 },
        { text: 'Responsable', width: 35 },
        { text: 'Descripción del Cambio', width: 40 },
      ]),
      dataRow([
        { text: '1.0', center: true },
        { text: '19/04/2026', center: true },
        { text: 'Isaac S. Castro / Ivan S. Pulgar' },
        { text: 'Versión inicial del análisis de inconsistencias.' },
      ], 0),
    ]
  });
}

// ─── Tabla metodología ────────────────────────────────────────────────────────
function buildMethodologyTable() {
  const criteria = [
    ['CRI-01', 'Contradicción de Alcance', 'Un elemento funcional aparece incluido en un documento y excluido en otro del mismo proyecto.'],
    ['CRI-02', 'Brecha de Implementación', 'El código fuente o el prototipo no refleja lo especificado en la documentación de requisitos o arquitectura.'],
    ['CRI-03', 'Falta de Evidencia', 'Un atributo de calidad, resultado de prueba o métricas están definidos pero no se presentan resultados medibles.'],
    ['CRI-04', 'Incoherencia de Nomenclatura', 'Nombres de entidades, roles, módulos o la empresa aparecen con variantes distintas en los documentos.'],
    ['CRI-05', 'Omisión de Componente', 'Un servicio o componente arquitectónico referenciado en un documento no está modelado explícitamente en los diagramas.'],
    ['CRI-06', 'Inconsistencia de Integración', 'El plan prevé integración real (API, BD, servicios externos) que no se constata en el informe de ejecución.'],
    ['CRI-07', 'Error Ortográfico / Tipográfico', 'Términos técnicos o comerciales con errores de escritura que afectan la credibilidad del documento.'],
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow([
        { text: 'ID Criterio', width: 10 },
        { text: 'Tipo de Inconsistencia', width: 25 },
        { text: 'Definición Operacional', width: 65 },
      ]),
      ...criteria.map((c, i) => dataRow([
        { text: c[0], bold: true, center: true },
        { text: c[1], bold: true },
        { text: c[2] },
      ], i))
    ]
  });
}

// ─── Tabla revisores ─────────────────────────────────────────────────────────
function buildReviewersTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow([
        { text: 'Rol', width: 30 },
        { text: 'Nombre', width: 40 },
        { text: 'Responsabilidad', width: 30 },
      ]),
      dataRow([
        { text: 'Director / Tutor Académico' },
        { text: 'Ing. Jaime David Camacho Castillo' },
        { text: 'Validación académica y metodológica' },
      ], 0),
      dataRow([
        { text: 'Responsable Funcional' },
        { text: 'Isaac Sebastián Castro Muesmueran' },
        { text: 'Revisión de alineamiento con requisitos' },
      ], 1),
      dataRow([
        { text: 'Responsable Técnico' },
        { text: 'Ivan Santiago Pulgar León' },
        { text: 'Revisión de alcance técnico y código' },
      ], 0),
    ]
  });
}

// ─── Tabla de priorización ────────────────────────────────────────────────────
function buildPrioritizationTable(level, color, items) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          tc(`INCONSISTENCIAS ${level.toUpperCase()}`, { bg: color, bold: true, center: true, color: level === 'Media' || level === 'Baja' ? '000000' : COLORS.white, span: 3, size: 22 }),
        ]
      }),
      headerRow([
        { text: 'ID', width: 12 },
        { text: 'Descripción resumida', width: 60 },
        { text: 'Sprint sugerido', width: 28 },
      ]),
      ...items.map((item, i) => dataRow([
        { text: item[0], bold: true, center: true },
        { text: item[1] },
        { text: item[2], center: true },
      ], i))
    ]
  });
}

// ─── DOCUMENTO PRINCIPAL ──────────────────────────────────────────────────────
async function generateDocument() {
  const doc = new Document({
    creator: 'Isaac S. Castro & Ivan S. Pulgar — ESPOCH FIE',
    title: 'Análisis de Inconsistencias — Sistema de Gestión Integral ICARO CONSTRUCTORES BMGM S.A.S.',
    description: 'Documento académico de análisis de inconsistencias entre artefactos documentales del proyecto ICARO, elaborado en la ESPOCH FIE Carrera de Software.',
    styles: {
      default: {
        document: {
          run: { font, size: 22 }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          size: { width: convertInchesToTwip(8.5), height: convertInchesToTwip(11) },
          margin: {
            top:    convertInchesToTwip(1.0),
            right:  convertInchesToTwip(1.0),
            bottom: convertInchesToTwip(1.0),
            left:   convertInchesToTwip(1.25),
          }
        }
      },

      children: [

        // ══════════════════════════════════════════════════════════════════════
        // 1. PORTADA
        // ══════════════════════════════════════════════════════════════════════
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300, before: 600 },
          children: [new TextRun({ text: 'ESCUELA SUPERIOR POLITÉCNICA DE CHIMBORAZO', font, size: 26, bold: true, color: COLORS.primary })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: 'FACULTAD DE INFORMÁTICA Y ELECTRÓNICA', font, size: 24, bold: true, color: COLORS.primary })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: 'CARRERA DE SOFTWARE', font, size: 24, bold: true, color: COLORS.primary })],
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          border: {
            top:    { color: COLORS.accent, size: 12, style: BorderStyle.SINGLE },
            bottom: { color: COLORS.accent, size: 12, style: BorderStyle.SINGLE },
          },
          children: [new TextRun({ text: 'ANÁLISIS DE INCONSISTENCIAS', font, size: 48, bold: true, color: COLORS.primary, allCaps: true })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: 'SISTEMA DE GESTIÓN INTEGRAL', font, size: 34, bold: true, color: COLORS.accent })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: 'ICARO CONSTRUCTORES BMGM S.A.S.', font, size: 30, bold: true, italics: true, color: COLORS.accent })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: 'Análisis comparativo entre artefactos documentales del proyecto de titulación', font, size: 24, italics: true, color: COLORS.darkGray })],
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: 'Autores:', font, size: 22, bold: true })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: 'Isaac Sebastián Castro Muesmueran', font, size: 22 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [new TextRun({ text: 'Ivan Santiago Pulgar León', font, size: 22 })],
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: 'Director:', font, size: 22, bold: true })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [new TextRun({ text: 'Ing. Jaime David Camacho Castillo', font, size: 22 })],
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [new TextRun({ text: 'Riobamba – Ecuador', font, size: 22 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: 'Abril 2026', font, size: 22, bold: true })],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 2. CONTROL DOCUMENTAL
        // ══════════════════════════════════════════════════════════════════════
        h1('2. Control Documental'),

        h2('2.1 Historial de Versiones'),
        buildVersionTable(),
        spacer(200),

        h2('2.2 Revisores y Aprobadores'),
        buildReviewersTable(),
        spacer(200),

        h2('2.3 Propósito del Documento'),
        bodyPara(
          'El presente documento constituye un análisis sistemático, formal y evidenciado de las inconsistencias identificadas entre los artefactos documentales que conforman el proyecto "Desarrollo de un Sistema Web y Móvil para la Gestión Integral en la Empresa ICARO CONSTRUCTORES BMGM S.A.S.", elaborado como Trabajo de Titulación en la Carrera de Software de la ESPOCH FIE.'
        ),
        bodyPara(
          'Su propósito es establecer un registro técnico auditado que permita a los autores, al director académico y a futuros evaluadores identificar de manera precisa qué elementos del sistema presentan contradicciones, omisiones, brechas de implementación o inconsistencias de nomenclatura entre los distintos documentos técnicos, académicos y de código fuente del proyecto.'
        ),
        bodyPara(
          'El documento pivot de referencia para este análisis es "Analisis_Inconsistencias_Historias_Usuario.pdf", complementado con la revisión exhaustiva del código fuente (backend Node.js, frontend React, esquema Prisma/PostgreSQL) y la totalidad de artefactos documentales identificados.'
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 3. RESUMEN EJECUTIVO
        // ══════════════════════════════════════════════════════════════════════
        h1('3. Resumen Ejecutivo'),

        bodyPara(
          'El presente análisis revisó un total de trece (13) artefactos documentales y el código fuente del repositorio del proyecto ICARO, identificando quince (15) inconsistencias clasificadas según su naturaleza y severidad. De estas, dos (2) son de severidad Crítica, ocho (8) de severidad Alta, tres (3) de severidad Media y dos (2) de severidad Baja, sumando un total de 15 inconsistencias que requieren atención antes de continuar con las fases de integración y entrega final del proyecto.'
        ),
        bodyPara(
          'Las inconsistencias críticas más relevantes son: (a) la contradicción entre el alcance definido en el documento principal y las historias de usuario respecto a la inclusión o exclusión del módulo de gestión documental avanzada; y (b) la ausencia de implementación operativa del backend para los módulos de avances, compras e inventario, cuyas rutas en server.js se encuentran comentadas, a pesar de que el alcance del proyecto los define como módulos plenamente funcionales.'
        ),
        bodyPara(
          'Entre las inconsistencias de severidad Alta, se destacan la ausencia de evidencia de medición de los atributos no funcionales definidos (P95 < 2000 ms, SUS > 75), la operación exclusiva del frontend con datos mock sin consumo real de API REST, la omisión del repositorio backend con sus 15 pruebas automatizadas en el Informe de Ejecución, y la carga estática de roles en la interfaz de administración de usuarios en lugar de consumir el endpoint dinámico ya implementado en el backend.'
        ),
        bodyPara(
          'Desde el punto de vista arquitectónico, se identificó que componentes críticos como el Local Cache + Sync Manager (requerido para operación offline en campo), el StorageService y el QueueService para generación de planillas PDF, no están explícitamente modelados en el documento de arquitectura, generando una brecha de trazabilidad entre el diseño documentado y los requisitos del sistema.'
        ),
        bodyPara(
          'El plan de acción propuesto prioriza la corrección de las inconsistencias críticas en el primer sprint de remediación (1 semana), seguido de las altas en el segundo sprint (2 semanas), y finaliza con las correcciones de formato en la fase de revisión final del documento. Se estima que la totalidad del plan de acción puede ejecutarse en un período no mayor a cuatro (4) semanas de trabajo conjunto del equipo de desarrollo.'
        ),
        bodyPara(
          'Este análisis fue elaborado mediante inspección directa del código fuente del repositorio, lectura de los documentos Word y Markdown disponibles, y revisión de las matrices de trazabilidad del proyecto. Las conclusiones son verificables y están soportadas por referencias específicas a archivos, líneas de código y secciones de documentos.'
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 4. INTRODUCCIÓN
        // ══════════════════════════════════════════════════════════════════════
        h1('4. Introducción'),

        h2('4.1 Contexto del Proyecto'),
        bodyPara(
          'ICARO es un sistema ERP (Enterprise Resource Planning) corporativo especializado, desarrollado como proyecto de titulación en la Escuela Superior Politécnica de Chimborazo, Carrera de Software. Está orientado a digitalizar y centralizar los procesos técnicos, administrativos y contables de la empresa ICARO CONSTRUCTORES BMGM S.A.S., integrando los módulos de control de avance de obra, requerimientos de compra, inventario de materiales, cierres contables mensuales, generación de planillas PDF y reportes ejecutivos.'
        ),
        bodyPara(
          'El proyecto utiliza una arquitectura de Monolito en Capas con API REST (Node.js 24 + Express + Prisma + PostgreSQL 17) como backend, y un SPA/PWA React 18 + Vite como cliente frontend, con despliegue mediante Docker Compose. La metodología de desarrollo es SCRUM con sprints semanales, criterios DoR/DoD y revisiones de sprint. El sistema implementa RBAC con seis roles definidos y un sistema de auditoría inmutable con registro de todas las operaciones CUD.'
        ),
        bodyPara(
          'Al momento de la elaboración del presente análisis, el proyecto cuenta con un backend parcialmente implementado (módulos de autenticación, gestión de usuarios y proyectos completamente funcionales; módulos de avances, compras e inventario con backend pendiente), un frontend con cobertura visual amplia pero operando principalmente con datos mock, y una suite de 15 pruebas automatizadas de seguridad y RBAC en Jest + Supertest.'
        ),

        h2('4.2 Justificación del Análisis'),
        bodyPara(
          'La revisión cruzada de artefactos documentales en proyectos de ingeniería de software es una práctica fundamental de aseguramiento de calidad, reconocida en estándares como ISO/IEC 25010:2023 y marcos como CMMI. En el contexto de un trabajo de titulación, esta actividad adquiere especial relevancia porque los documentos técnicos constituyen simultáneamente evidencia académica y especificación del sistema a construir.'
        ),
        bodyPara(
          'La identificación temprana de inconsistencias permite al equipo de desarrollo corregir contradicciones antes de que generen deuda técnica, re-trabajo o incoherencias en la defensa del trabajo. Asimismo, documenta el estado real del proyecto con rigor verificable, diferenciando entre lo especificado, lo implementado y lo pendiente de evidenciar.'
        ),

        h2('4.3 Documento Base (Pivote)'),
        bodyPara(
          'El documento "Analisis_Inconsistencias_Historias_Usuario.pdf" se utiliza como pivote de referencia de este análisis, dado que sintetiza las historias de usuario, los requisitos funcionales y las expectativas del sistema desde la perspectiva del usuario final. Cada inconsistencia identificada se contrasta con este documento y con el resto del corpus documental del proyecto, incluyendo el código fuente del repositorio como fuente primaria de verdad sobre el estado de implementación.'
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 5. OBJETIVOS
        // ══════════════════════════════════════════════════════════════════════
        h1('5. Objetivos del Análisis'),

        h2('5.1 Objetivo General'),
        bodyPara(
          'Identificar, clasificar y documentar de manera sistemática las inconsistencias, contradicciones y brechas existentes entre los artefactos documentales del proyecto ICARO y el estado real de implementación del sistema, con el fin de proporcionar al equipo de desarrollo un plan de corrección priorizado que garantice la coherencia entre la especificación, la arquitectura, las pruebas y el código fuente antes de la entrega final del trabajo de titulación.'
        ),

        h2('5.2 Objetivos Específicos'),
        bullet('Inventariar y caracterizar todos los artefactos documentales del proyecto (PDFs, DOCXs, XLSXs y archivos Markdown) e identificar las relaciones de dependencia entre ellos.'),
        bullet('Revisar el código fuente del repositorio (backend, frontend, schema Prisma) como evidencia primaria del estado real de implementación, contrastándolo con lo especificado en la documentación.'),
        bullet('Clasificar cada inconsistencia encontrada según su tipo (alcance, requisito funcional, requisito no funcional, arquitectura, pruebas, auditoría, roles, formato) y nivel de severidad (Crítica, Alta, Media, Baja).'),
        bullet('Construir una matriz consolidada de inconsistencias con identificación única, origen y destino documentales, descripción técnica precisa y estado de resolución.'),
        bullet('Elaborar un plan de acción con responsables, plazos y criterios de aceptación para la corrección de cada inconsistencia identificada, priorizado por severidad y dependencia técnica.'),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 6. METODOLOGÍA
        // ══════════════════════════════════════════════════════════════════════
        h1('6. Metodología de Revisión'),

        h2('6.1 Tipo de Revisión'),
        bodyPara(
          'Se aplicó una revisión técnica formal de tipo cruzado (cross-reference review), en la que cada afirmación de un documento es contrastada contra otros documentos del mismo proyecto y contra el código fuente del repositorio. El análisis es de naturaleza descriptiva-comparativa: no emite juicios de valor sobre las decisiones técnicas adoptadas, sino que registra objetivamente las divergencias entre artefactos.'
        ),
        bodyPara(
          'La revisión se realizó en cuatro fases: (1) Inventario y caracterización de documentos; (2) Lectura analítica de cada artefacto; (3) Inspección directa del código fuente; (4) Contraste cruzado y clasificación de inconsistencias.'
        ),

        h2('6.2 Criterios de Clasificación'),
        buildMethodologyTable(),
        spacer(200),

        h2('6.3 Niveles de Severidad'),
        buildSeverityTable(),
        spacer(200),

        h2('6.4 Fuentes de Evidencia'),
        bullet('Archivos del repositorio Git: backend/src/**, frontend/src/**, prisma/schema.prisma, docker-compose.yml'),
        bullet('Documentos Word: Plan_Pruebas_Verificacion_Validacion_Integracion_ICARO.docx, Informe_Ejecucion_Plan_Pruebas_Verificacion_Validacion_Integracion_ICARO_v3.docx'),
        bullet('Archivos Markdown: arquitectura_sistema_icaro.md, sprint_semana2_implementacion.md'),
        bullet('Documento pivote: Analisis_Inconsistencias_Historias_Usuario.pdf'),
        bullet('Matrices Excel: Matrices_Plan_Pruebas_ICARO.xlsx, Matrices_Trazabilidad_ICARO.xlsx'),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 7. INVENTARIO DOCUMENTAL
        // ══════════════════════════════════════════════════════════════════════
        h1('7. Inventario Documental Revisado'),

        bodyPara(
          'Se identificaron y revisaron los siguientes trece (13) artefactos documentales como corpus de análisis. La numeración DOC-01 a DOC-13 se utiliza como referencia en la matriz de inconsistencias.'
        ),
        spacer(100),
        buildInventoryTable(),
        spacer(200),

        bodyPara(
          'Los documentos de tipo PDF no pudieron ser extraídos mediante herramientas automatizadas por restricciones del entorno de ejecución; sin embargo, su contenido fue referenciado a través de los documentos homólogos Word, las matrices Excel y los archivos Markdown, que reproducen o sintetizan su contenido clave. El código fuente del repositorio fue revisado directamente mediante inspección de archivos.'
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 8. LÍNEA BASE DOCUMENTAL
        // ══════════════════════════════════════════════════════════════════════
        h1('8. Línea Base Documental'),

        h2('8.1 Tema Central del Proyecto'),
        bodyPara(
          'El proyecto ICARO tiene como tema central el desarrollo de un sistema web y móvil para la gestión integral de los procesos técnicos, administrativos y contables de una empresa constructora (ICARO CONSTRUCTORES BMGM S.A.S.), con énfasis en: control de avance de obra por rubros, gestión de compras, inventario de materiales, cierres contables mensuales, generación de planillas PDF, seguridad multi-rol con auditoría inmutable, y disponibilidad en campo mediante capacidades offline.'
        ),

        h2('8.2 Alcance Base Aprobado'),
        bodyPara(
          'Según el documento de alcance (DOC-01), el proyecto cubre los dominios técnico (avance de obra, rubros, evidencia fotográfica), administrativo (compras, inventario, parametrización) e inventario-contable (cierres mensuales, planillas PDF, reportes). Quedan explícitamente excluidos de la iteración actual: la gestión documental avanzada, la integración con sistemas externos de nómina y la comunicación con proveedores por EDI.'
        ),

        h2('8.3 Línea Funcional de Referencia'),
        bodyPara(
          'La línea funcional base se establece a partir de los seis roles del sistema (Administrador del Sistema, Presidente/Gerente, Contador, Auxiliar de Contabilidad, Residente, Bodeguero) y los ocho módulos funcionales principales: Autenticación, Administración de Usuarios, Gestión de Proyectos, Avance de Obra, Compras, Inventario, Contabilidad y Reportes. A estos se agrega un módulo transversal de Auditoría accesible exclusivamente por el Administrador del Sistema.'
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 9. ANÁLISIS POR CATEGORÍA
        // ══════════════════════════════════════════════════════════════════════
        h1('9. Análisis de Inconsistencias por Categoría'),

        // 9.1 Alcance
        h2('9.1 Categoría: Alcance del Sistema'),
        h3('INC-ALC-01 — Gestión Documental: Incluida vs. Excluida'),
        bodyPara(
          'Inconsistencia de tipo CRI-01 (Contradicción de Alcance). El documento "ALCANCE DE UN PROYECTO.pdf" (DOC-01) establece que la gestión documental avanzada queda fuera del alcance de la iteración actual del sistema, limitándose los dominios a lo técnico, administrativo e inventario-contable. Sin embargo, en el documento "Analisis_Inconsistencias_Historias_Usuario.pdf" (DOC-11), varias historias de usuario hacen referencia explícita a funcionalidades de carga, organización y consulta de documentos que van más allá de la evidencia fotográfica de obra.'
        ),
        bodyPara(
          'Esta contradicción genera ambigüedad operativa: el equipo de backend no sabe si debe implementar un módulo de gestión documental, y el frontend ya incluye componentes relacionados. La severidad es Crítica porque afecta directamente la definición del alcance y puede impactar la evaluación académica del trabajo.',
          { bold: false }
        ),
        bullet('Evidencia en código: No existe una ruta /documentos en server.js ni un modelo Documento en schema.prisma.'),
        bullet('Resolución requerida: Decidir formalmente si el módulo entra al backlog actual o queda para una fase posterior, y actualizar ambos documentos de forma coherente.'),

        h3('INC-ALC-02 — Backend Parcial vs. Alcance Completo'),
        bodyPara(
          'Inconsistencia de tipo CRI-02 (Brecha de Implementación). El alcance define un sistema con módulos de avances, compras, inventario y contabilidad plenamente operativos. Sin embargo, en el archivo backend/src/server.js, las rutas correspondientes a estos módulos están comentadas:'
        ),
        new Paragraph({
          spacing: { before: 100, after: 100 },
          indent: { left: 720 },
          children: [new TextRun({
            text: '// app.use(\'/api/v1/avances\', avancesRoutes);   // pendiente',
            font: 'Courier New', size: 20, italics: true, color: '595959'
          })]
        }),
        new Paragraph({
          spacing: { before: 100, after: 200 },
          indent: { left: 720 },
          children: [new TextRun({
            text: '// app.use(\'/api/v1/compras\', comprasRoutes);   // pendiente',
            font: 'Courier New', size: 20, italics: true, color: '595959'
          })]
        }),
        bodyPara(
          'El Informe de Ejecución (DOC-07) también lo reconoce: "no se evidenció una capa de consumo real de API ni archivos de pruebas automatizadas específicos". Esto significa que el sistema presentado en el informe es, en rigor, un prototipo frontend con mocks, no un sistema integrado conforme al alcance aprobado. Severidad: Crítica.'
        ),

        // 9.2 Requisitos Funcionales
        h2('9.2 Categoría: Requisitos Funcionales'),
        h3('INC-RF-01 — Planillaje PDF como Módulo vs. Sub-reporte'),
        bodyPara(
          'La generación de planillas PDF de cierres mensuales está implementada en el esquema Prisma con un modelo dedicado (PlanillaPdf) con relación a CierreMensual, lo que indica que se diseñó como un proceso autónomo con persistencia propia. Sin embargo, en algunos documentos del plan de pruebas, la generación de planillas aparece categorizada como una funcionalidad secundaria del módulo de reportes, en lugar de como un proceso crítico independiente con sus propias reglas de negocio (hash de integridad, bloqueo posterior al cierre).'
        ),
        bodyPara(
          'Esta inconsistencia reduce la cobertura de pruebas asignada a una funcionalidad crítica para el cierre contable mensual. Severidad: Alta.'
        ),

        // 9.3 Requisitos No Funcionales
        h2('9.3 Categoría: Requisitos No Funcionales'),
        h3('INC-RNF-01 — RNF Definidos sin Evidencia de Medición'),
        bodyPara(
          'El SRS (DOC-03) define atributos de calidad con métricas medibles, entre los que se encuentran: tiempo de respuesta P95 menor a 2000 ms, puntuación SUS mayor a 75 puntos, disponibilidad mayor al 99%, y trazabilidad auditada de todas las operaciones CUD. Estos atributos se retoman en el documento de arquitectura (DOC-09) bajo la tabla de drivers arquitectónicos.'
        ),
        bodyPara(
          'El Informe de Ejecución (DOC-07), sin embargo, no incluye resultados de medición para ninguno de estos atributos. La sección de cobertura por categoría indica que la "Validación" es "Media / Preliminar" y que no hay "evidencia de aplicación SUS ni observación con usuarios". Esto constituye una brecha grave entre la definición de criterios de aceptación y su verificación formal. Severidad: Alta.'
        ),

        // 9.4 Historias de Usuario
        h2('9.4 Categoría: Historias de Usuario'),
        h3('INC-HU-01 — Modo Offline en Campo sin Implementación'),
        bodyPara(
          'El documento de alcance y el de arquitectura reconocen que la "Disponibilidad" es un atributo de prioridad Alta dado que "la operación en campo puede ser intermitente" y se "necesita modo offline". Las historias de usuario del módulo de obra móvil contemplan que el Residente pueda registrar avances sin conectividad y sincronizarlos al recuperar la conexión.'
        ),
        bodyPara(
          'Sin embargo, no existe en el frontend ningún componente de Local Cache, IndexedDB, Service Worker con estrategia de caché, ni cola de sincronización. El Informe de Ejecución no menciona estos componentes. Esta brecha es especialmente relevante porque el proyecto se describe como "sistema web y móvil" con uso en campo. Severidad: Alta.'
        ),

        // 9.5 Arquitectura
        h2('9.5 Categoría: Arquitectura'),
        h3('INC-ARQ-01 — StorageService sin Modelado Explícito'),
        bodyPara(
          'El esquema Prisma incluye el modelo EvidenciaFotografica con campos de URL y nombreArchivo, y el sprint 2 menciona la necesidad de un StorageService para el almacenamiento de archivos en la nube (o local). Sin embargo, el diagrama de componentes de arquitectura (DOC-09) no incluye el StorageService como componente de servicio del backend, limitándose a listar: audit.service y "(futuro: email, storage)".'
        ),
        bodyPara(
          'Esta omisión genera inconsistencia entre la capacidad técnica modelada en el esquema de datos y la arquitectura documentada. El Informe de Ejecución tampoco menciona cómo se gestiona el almacenamiento de archivos. Severidad: Alta.'
        ),

        h3('INC-ARQ-02 — QueueService para Planillas PDF sin Modelado'),
        bodyPara(
          'El proceso de generación de planillas PDF a partir de los cierres mensuales requiere, por su naturaleza computacional (rendering HTML→PDF, firma de hash), ejecución asíncrona mediante una cola de trabajos. Sin embargo, el QueueService no aparece como componente en el diagrama de arquitectura ni en el docker-compose.yml como servicio externo (por ejemplo, Redis + Bull). Severidad: Alta.'
        ),

        h3('INC-ARQ-03 — Capa Offline sin Diagrama Explícito'),
        bodyPara(
          'La arquitectura como PWA (Progressive Web App) requiere la definición explícita de la estrategia de caché, el Service Worker y el mecanismo de sincronización (Sync Manager). Ninguno de estos elementos aparece en el diagrama de arquitectura DOC-09, que describe el frontend simplemente como "React 18 + Vite · Puerto 5173" sin distinguir las capacidades PWA. Severidad: Crítica (compromete una promesa central del sistema: operar en campo sin conexión).'
        ),

        // 9.6 Pruebas
        h2('9.6 Categoría: Plan y Resultados de Pruebas'),
        h3('INC-PRU-01 — Plan de Integración vs. Frontend con Mocks'),
        bodyPara(
          'El Plan de Pruebas (DOC-06) define explícitamente pruebas de integración que validan la comunicación entre el frontend y el backend mediante llamadas API reales, persistencia en base de datos y comportamientos de sincronización. No obstante, el Informe de Ejecución (DOC-07) constata que "no se evidenció una capa de consumo real de API", que el prototipo "depende fuertemente de datos mock" y que "32 archivos de datos de prueba con nombres descriptivos" son la base del comportamiento visible del sistema.'
        ),
        bodyPara(
          'Esta inconsistencia implica que las pruebas de integración planificadas no pudieron ejecutarse, y el informe no documenta claramente qué acción correctiva se tomará para completarlas. Severidad: Alta.'
        ),

        h3('INC-PRU-02 — SUS Planificado sin Resultados'),
        bodyPara(
          'El Plan de Pruebas establece la aplicación del cuestionario SUS (System Usability Scale) como criterio formal de validación de usabilidad con umbral de aceptación SUS ≥ 75. El Informe de Ejecución reconoce explícitamente: "no hay evidencia de aplicación SUS ni observación con usuarios". Severidad: Alta.'
        ),

        h3('INC-PRU-03 — 15 Tests Automatizados Omitidos en el Informe'),
        bodyPara(
          'El sprint 2 (DOC-10) documenta la creación y ejecución de una suite de 15 pruebas automatizadas en Jest + Supertest (backend/tests/security.test.js), que cubre validación de JWT, RBAC, acceso por proyecto y rutas públicas, con resultado 15/15 PASS. Sin embargo, el Informe de Ejecución (DOC-07) señala en VR-08: "No se encontraron archivos específicos de pruebas del proyecto — No evidenciado".'
        ),
        bodyPara(
          'Esto constituye una omisión de evidencia técnica existente: las pruebas están implementadas en el repositorio y pasan correctamente, pero no fueron incluidas en el informe de ejecución. Severidad: Alta, dado que reduce artificialmente la percepción de madurez técnica del proyecto.'
        ),

        // 9.7 Auditoría
        h2('9.7 Categoría: Auditoría e Inmutabilidad'),
        h3('INC-AUD-01 — Inmutabilidad a Nivel de Aplicación, No a Nivel de BD'),
        bodyPara(
          'El diseño del sistema declara que el audit_log es "inmutable", lo que implica que los registros de auditoría no pueden ser modificados ni eliminados una vez creados. La implementación en audit.service.js garantiza que los registros siempre se insertan (logAction nunca actualiza ni elimina). Sin embargo, no existen triggers BEFORE UPDATE / BEFORE DELETE en la base de datos PostgreSQL sobre la tabla audit_log, ni se han aplicado permisos REVOKE UPDATE/DELETE al usuario de la aplicación.'
        ),
        bodyPara(
          'Esto significa que la inmutabilidad es una convención de aplicación, no un control técnico de base de datos. Un acceso directo al motor de PostgreSQL (o un cambio futuro en el código) podría modificar los registros de auditoría sin obstáculo. Severidad: Media (no bloquea el sistema, pero compromete la garantía de trazabilidad legal/contractual).'
        ),

        // 9.8 Roles
        h2('9.8 Categoría: Gestión de Roles (RBAC)'),
        h3('INC-ROL-01 — Roles Estáticos en Frontend vs. API Dinámica'),
        bodyPara(
          'El backend implementa y expone el endpoint GET /api/v1/users/roles (users.routes.js + users.controller.js) que retorna los roles disponibles desde la base de datos. El servicio frontend usersApi.js también define la función getRoles() que consume dicho endpoint.'
        ),
        bodyPara(
          'Sin embargo, los componentes de UI que requieren la lista de roles (AdminUsersPermissionsView.jsx, UserFormModal.jsx y RoleAssignmentModal.jsx) cargan los roles desde availableRoles, un array estático definido en mockUsers.js, sin invocar getRoles(). Esto significa que si un administrador agrega un nuevo rol en la base de datos, la interfaz no lo reflejaría sin una actualización de código. Severidad: Alta.'
        ),

        // 9.9 Formato
        h2('9.9 Categoría: Formato y Redacción'),
        h3('INC-FOR-01 — Errores Tipográficos en Términos Técnicos'),
        bodyPara(
          'Se identificaron errores tipográficos en el Informe de Ejecución (DOC-07) y en el Plan de Pruebas (DOC-06): "Phyton" en lugar de "Python" y "Microsoft Proyect" en lugar de "Microsoft Project". Aunque no afectan el comportamiento del sistema, estos errores reducen la credibilidad académica de los documentos de titulación. Severidad: Baja.'
        ),

        h3('INC-FOR-02 — Nomenclatura Inconsistente de la Empresa'),
        bodyPara(
          'La empresa aparece mencionada con cuatro variantes distintas a lo largo de los documentos: "ICAROCONSTRUCTORES", "ICARO CONSTRUCTORES", "ICARO CONSTRUCTORES BMGM" e "ICARO CONSTRUCTORES BMGM S.A.S.". La denominación oficial del proyecto es "ICARO CONSTRUCTORES BMGM S.A.S." y debe utilizarse de forma consistente en todos los encabezados, portadas y referencias documentales. Severidad: Media.'
        ),

        // 9.10 Síntesis por categoría
        h2('9.10 Síntesis del Análisis por Categoría'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            headerRow([
              { text: 'Categoría', width: 22 },
              { text: 'Inconsistencias', width: 13 },
              { text: 'Severidad Máxima', width: 18 },
              { text: 'Impacto Principal', width: 47 },
            ]),
            ...[
              ['Alcance', '2', 'Crítica', 'Define qué se construye; contradicción impacta toda la planificación'],
              ['Requisitos Funcionales', '1', 'Alta', 'Sub-módulo crítico tratado como secundario'],
              ['Requisitos No Funcionales', '1', 'Alta', 'Métricas de calidad sin evidencia de medición'],
              ['Historias de Usuario', '1', 'Alta', 'Funcionalidad offline prometida no implementada'],
              ['Arquitectura', '3', 'Crítica', 'Componentes críticos sin modelado explícito'],
              ['Pruebas', '3', 'Alta', 'Integración no constatable; SUS pendiente; tests omitidos'],
              ['Auditoría', '1', 'Media', 'Inmutabilidad a nivel app sin respaldo en BD'],
              ['Roles / RBAC', '1', 'Alta', 'Roles estáticos vs. API dinámica implementada'],
              ['Formato y Redacción', '2', 'Media', 'Errores tipográficos y nomenclatura inconsistente'],
            ].map((r, i) => dataRow([
              { text: r[0], bold: true },
              { text: r[1], center: true },
              { text: r[2], center: true, bold: r[2] === 'Crítica', color: r[2] === 'Crítica' ? COLORS.red : '000000' },
              { text: r[3] },
            ], i))
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 10. MATRIZ CONSOLIDADA
        // ══════════════════════════════════════════════════════════════════════
        h1('10. Matriz Consolidada de Inconsistencias'),

        bodyPara(
          'La siguiente matriz presenta las quince (15) inconsistencias identificadas con su clasificación completa. El campo "Estado" refleja que todas las inconsistencias están Abiertas al momento de la elaboración de este documento. Se actualizará a "Resuelta" conforme se ejecuten las acciones correctivas del Plan de Acción (Sección 13).'
        ),
        spacer(100),
        buildInconsistencyTable(),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 11. PRIORIZACIÓN
        // ══════════════════════════════════════════════════════════════════════
        h1('11. Priorización de Inconsistencias'),

        bodyPara('Las inconsistencias se priorizan según su nivel de severidad y su impacto en la continuidad del proyecto de titulación.'),
        spacer(100),

        buildPrioritizationTable('Crítica', COLORS.critRed, [
          ['INC-ALC-02', 'Backend parcialmente implementado; rutas de módulos principales comentadas en server.js', 'Sprint inmediato'],
          ['INC-ALC-01', 'Gestión documental incluida en HU pero excluida en alcance; requiere decisión formal', 'Sprint inmediato'],
          ['INC-ARQ-03', 'Arquitectura offline (Local Cache + Sync Manager) no modelada para el módulo de obra móvil', 'Sprint inmediato'],
        ]),
        spacer(200),

        buildPrioritizationTable('Alta', COLORS.critOrange, [
          ['INC-PRU-03', 'Suite de 15 tests automatizados existente no documentada en el Informe de Ejecución', 'Sprint 1'],
          ['INC-ROL-01', 'Frontend carga roles desde mock estático; endpoint getRoles() no consumido', 'Sprint 1'],
          ['INC-PRU-01', 'Plan de integración planificado; frontend opera solo con mocks', 'Sprint 1'],
          ['INC-ARQ-01', 'StorageService no modelado como componente explícito en arquitectura', 'Sprint 1'],
          ['INC-ARQ-02', 'QueueService para PDF no en docker-compose ni en diagrama de arquitectura', 'Sprint 1'],
          ['INC-HU-01', 'Modo offline en campo sin implementación en frontend (Service Worker, IndexedDB)', 'Sprint 2'],
          ['INC-PRU-02', 'Cuestionario SUS planificado pero no aplicado con usuarios reales', 'Sprint 2'],
          ['INC-RF-01', 'Planillaje PDF tratado como sub-reporte, no como módulo crítico autónomo', 'Sprint 2'],
          ['INC-RNF-01', 'RNF con métricas definidas (P95, SUS, disponibilidad) sin evidencia de medición', 'Sprint 2'],
        ]),
        spacer(200),

        buildPrioritizationTable('Media', COLORS.critYellow, [
          ['INC-AUD-01', 'Inmutabilidad audit_log garantizada por app, no por triggers de BD PostgreSQL', 'Sprint 2–3'],
          ['INC-FOR-02', 'Nombre de empresa con 4 variantes; debe unificarse como "ICARO CONSTRUCTORES BMGM S.A.S."', 'Revisión final'],
        ]),
        spacer(200),

        buildPrioritizationTable('Baja', COLORS.critGreen, [
          ['INC-FOR-01', '"Phyton" → "Python"; "Microsoft Proyect" → "Microsoft Project" en documentos', 'Revisión final'],
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 12. RECOMENDACIONES
        // ══════════════════════════════════════════════════════════════════════
        h1('12. Recomendaciones de Corrección'),

        h2('12.1 Recomendaciones para Inconsistencias Críticas'),
        bodyPara(
          'Para INC-ALC-01 e INC-ALC-02 se recomienda convocar una reunión de revisión de alcance con el director del trabajo de titulación para decidir formalmente qué módulos se entregarán en la iteración final. Esta decisión debe reflejarse por escrito en el documento de alcance y en el backlog del sprint. Simultáneamente, se debe proceder a implementar y registrar los controladores de avances, compras e inventario, habilitando sus rutas en server.js.'
        ),
        bodyPara(
          'Para INC-ARQ-03, se recomienda añadir al documento de arquitectura un diagrama específico de la capa PWA/offline, que incluya: Service Worker con estrategia Cache-First para recursos estáticos, IndexedDB para almacenamiento local de registros de obra, y un Sync Manager que detecte reconexión y envíe los registros pendientes al backend mediante la ruta /api/v1/avances.'
        ),

        h2('12.2 Recomendaciones para Inconsistencias Altas'),
        bodyPara(
          'Para INC-PRU-03: actualizar el Informe de Ejecución con una sección "Pruebas Automatizadas del Backend", incluyendo los resultados de la suite security.test.js (15/15 tests PASS) con captura de pantalla de la terminal y descripción de los casos cubiertos.'
        ),
        bodyPara(
          'Para INC-ROL-01: modificar AdminUsersPermissionsView.jsx para que el useEffect inicial invoque usersApi.getRoles() y almacene el resultado en estado local. Actualizar UserFormModal.jsx y RoleAssignmentModal.jsx para recibir los roles como prop desde la vista padre.'
        ),
        bodyPara(
          'Para INC-PRU-02: diseñar un protocolo SUS de cinco sesiones con usuarios representativos (un residente, un contador, un bodeguero, un administrador y el gerente). Tabular los resultados, calcular el score SUS promedio y documentarlo en el Informe de Ejecución. Si el score es inferior a 75, diseñar correcciones de UI y re-evaluar.'
        ),
        bodyPara(
          'Para INC-RNF-01: ejecutar una prueba de carga básica con Apache JMeter o k6 sobre los endpoints principales del backend y registrar el tiempo de respuesta P95. Si la arquitectura no soporta los RNF definidos, actualizar las métricas en el SRS con valores reales alcanzables.'
        ),

        h2('12.3 Recomendaciones para Inconsistencias Medias y Bajas'),
        bodyPara(
          'Para INC-AUD-01: agregar en la migración de Prisma o en un script SQL separado los triggers BEFORE UPDATE y BEFORE DELETE sobre la tabla audit_log que lancen una excepción, impidiendo cualquier modificación. Además, documentar en la arquitectura que el usuario de la aplicación solo tiene permisos INSERT sobre dicha tabla.'
        ),
        bodyPara(
          'Para INC-FOR-01 e INC-FOR-02: realizar una revisión ortográfica final de todos los documentos Word con el corrector integrado de Microsoft Word. Utilizar la función Buscar y Reemplazar para unificar todas las variantes del nombre de la empresa con la denominación oficial "ICARO CONSTRUCTORES BMGM S.A.S.".'
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 13. PLAN DE ACCIÓN
        // ══════════════════════════════════════════════════════════════════════
        h1('13. Plan de Acción'),

        bodyPara(
          'El siguiente plan de acción organiza las correcciones por orden de prioridad. Los responsables son los autores del proyecto; el director académico valida los cambios en la revisión del sprint correspondiente.'
        ),
        spacer(100),
        buildActionPlanTable(),
        spacer(200),

        bodyPara(
          'Criterio de aceptación global: el documento de análisis se considerará resuelto cuando la columna "Estado" de todas las filas de la Matriz Consolidada de Inconsistencias (Sección 10) haya sido actualizada a "Resuelta", con referencia al commit del repositorio o al documento corregido que lo evidencia.'
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 14. CONCLUSIONES
        // ══════════════════════════════════════════════════════════════════════
        h1('14. Conclusiones'),

        bodyPara(
          '1. El proyecto ICARO presenta una base técnica sólida en los módulos implementados. La suite de pruebas automatizadas (15/15 PASS), el middleware RBAC completamente funcional, el sistema de auditoría a nivel de aplicación y la implementación de JWT con manejo de roles demuestran un nivel de madurez técnica adecuado para la fase de desarrollo en que se encuentra el proyecto. La brecha principal no es de calidad de código, sino de coherencia entre la documentación y el estado de implementación.',
          { bold: false }
        ),
        spacer(80),
        bodyPara(
          '2. Las dos inconsistencias críticas identificadas (INC-ALC-01 e INC-ALC-02) requieren una decisión formal del equipo y el director antes de continuar el sprint. La contradicción entre el alcance documentado y el estado real del backend podría comprometer la evaluación del trabajo si no se resuelve con suficiente antelación.',
          { bold: false }
        ),
        spacer(80),
        bodyPara(
          '3. La ausencia de evidencia de medición de los atributos no funcionales (SUS, P95, disponibilidad) constituye una brecha metodológica significativa. Estos atributos no son decorativos en el SRS; son compromisos de calidad verificables que los evaluadores académicos esperarán ver evidenciados en el informe final.',
          { bold: false }
        ),
        spacer(80),
        bodyPara(
          '4. La inconsistencia INC-PRU-03 (tests automatizados existentes no documentados) es la más fácil de resolver y la que mayor impacto positivo tiene en la percepción del proyecto. Con una actualización del Informe de Ejecución que incluya los resultados de security.test.js, el proyecto pasa de "sin pruebas evidenciadas" a "con pruebas automatizadas completas de seguridad y RBAC".',
          { bold: false }
        ),
        spacer(80),
        bodyPara(
          '5. La arquitectura PWA/offline es un diferenciador competitivo del proyecto (operación en campo sin conexión), pero actualmente no está implementada ni documentada. Resolverla en el sprint siguiente es prioritario porque es una promesa central del alcance del sistema.',
          { bold: false }
        ),
        spacer(80),
        bodyPara(
          '6. La inconsistencia de roles (INC-ROL-01) representa un anti-patrón de integración que puede corregirse en menos de dos horas de trabajo de desarrollo. Es especialmente llamativa porque el endpoint dinámico ya está implementado y funcionando en el backend, pero no se consume desde el frontend.',
          { bold: false }
        ),
        spacer(80),
        bodyPara(
          '7. Las inconsistencias de formato y nomenclatura (INC-FOR-01, INC-FOR-02), aunque de baja severidad técnica, tienen alta visibilidad en la defensa del trabajo. Un evaluador externo que encuentre "Phyton" o cuatro variantes del nombre de la empresa en la misma presentación puede generar una impresión negativa desproporcionada respecto a su peso técnico real. Deben corregirse en la revisión final.',
          { bold: false }
        ),
        spacer(80),
        bodyPara(
          '8. La metodología de análisis cruzado aplicada en este documento puede ser reutilizada en futuros sprints del proyecto como un instrumento de aseguramiento de calidad continuo. Se recomienda actualizar este documento con cada entrega de sprint para mantener un registro actualizado del estado de coherencia del corpus documental.',
          { bold: false }
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════════════════════
        // 15. ANEXOS
        // ══════════════════════════════════════════════════════════════════════
        h1('15. Anexos'),

        h2('Anexo A — Estructura del Repositorio del Proyecto'),
        bodyPara('El repositorio del proyecto tiene la siguiente estructura principal al momento del análisis:'),
        spacer(80),
        ...[
          'backend/',
          '  src/server.js              — Punto de entrada Express; rutas de avances/compras comentadas',
          '  src/middlewares/',
          '    auth.middleware.js       — requireAuth + requireRole (RBAC completo)',
          '    audit.middleware.js      — Captura CUD global; logs post-response',
          '    projectAccess.middleware.js — Validación token + proyecto + rango de fechas',
          '  src/controllers/',
          '    users.controller.js     — CRUD usuarios con bcrypt round=12',
          '    auth.controller.js      — Login + JWT HS256 + change-password',
          '  src/services/',
          '    audit.service.js        — logAction() → audit_log; nunca lanza excepción',
          '  src/routes/',
          '    users.routes.js         — RBAC: solo ADMIN',
          '    proyectos.routes.js     — requireProjectAccess en GET /:id',
          '    auth.routes.js          — Rutas públicas + protegidas de sesión',
          '  tests/',
          '    security.test.js        — 15 tests Jest+Supertest (15/15 PASS)',
          '  prisma/',
          '    schema.prisma           — 14 modelos ORM (incl. AuditLog, PlanillaPdf)',
          '',
          'frontend/',
          '  src/views/                — 22 vistas por módulo',
          '  src/components/           — 282 componentes reutilizables',
          '  src/data/                 — 32 archivos de datos mock',
          '  src/services/',
          '    usersApi.js             — API + fallback mock; getRoles() definido pero no consumido en UI',
          '  src/store/',
          '    AuthContext.jsx         — Contexto de autenticación JWT',
        ].map(line => new Paragraph({
          spacing: { after: 40 },
          indent: { left: 360 },
          children: [new TextRun({ text: line, font: 'Courier New', size: 18, color: '1F3864' })]
        })),

        spacer(200),
        h2('Anexo B — Referencia de Roles del Sistema'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            headerRow([
              { text: 'Rol', width: 30 },
              { text: 'Módulos con Acceso', width: 50 },
              { text: 'Notas', width: 20 },
            ]),
            ...([
              ['Administrador del Sistema', 'Todos los módulos: usuarios, auditoría, configuración, proyectos, avances, compras, inventario, contabilidad, reportes', '—'],
              ['Presidente / Gerente', 'Proyectos, Avances, Compras, Reportes', '—'],
              ['Contador', 'Proyectos, Compras, Cierres, Reportes', '—'],
              ['Residente', 'Proyectos, Avances, Compras, Inventario', 'Requiere asignación vigente por proyecto'],
              ['Auxiliar de Contabilidad', 'Compras, Cierres (soporte)', '—'],
              ['Bodeguero', 'Inventario, Movimientos de Stock', '—'],
            ]).map((r, i) => dataRow([
              { text: r[0], bold: true },
              { text: r[1] },
              { text: r[2], center: true },
            ], i))
          ]
        }),

        spacer(200),
        h2('Anexo C — Glosario de Siglas'),
        ...[
          ['API REST', 'Application Programming Interface — Representational State Transfer'],
          ['RBAC', 'Role-Based Access Control'],
          ['JWT', 'JSON Web Token'],
          ['SRS', 'Software Requirements Specification'],
          ['SUS', 'System Usability Scale (cuestionario de usabilidad de 10 ítems)'],
          ['PWA', 'Progressive Web App'],
          ['CUD', 'Create, Update, Delete (operaciones de modificación de datos)'],
          ['P95', 'Percentil 95 del tiempo de respuesta'],
          ['ORM', 'Object-Relational Mapping'],
          ['ERP', 'Enterprise Resource Planning'],
          ['SCRUM', 'Marco ágil de desarrollo iterativo incremental'],
          ['DoR', 'Definition of Ready (criterios de entrada al sprint)'],
          ['DoD', 'Definition of Done (criterios de aceptación de la tarea)'],
        ].map((g, i) => new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: g[0] + ': ', font, size: 20, bold: true }),
            new TextRun({ text: g[1], font, size: 20 }),
          ]
        })),

      ]
    }]
  });

  const outputPath = path.join(
    'C:\\Users\\Hp\\Desktop\\Sistema_Gestion_Integral_Constructora',
    'Analisis_Inconsistencias_Sistema_Gestion_Integral_Constructora.docx'
  );

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`\n✅ Documento generado exitosamente:\n   ${outputPath}`);
  console.log(`   Tamaño: ${(buffer.length / 1024).toFixed(1)} KB`);
}

generateDocument().catch(err => {
  console.error('❌ Error al generar el documento:', err);
  process.exit(1);
});
