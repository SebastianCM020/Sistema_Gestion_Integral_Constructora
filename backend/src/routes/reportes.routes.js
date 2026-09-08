/**
 * reportes.routes.js — Dashboard y Reportes con KPIs reales
 *
 * Endpoints:
 *   GET /api/v1/reportes/dashboard        — KPIs reales calculados desde BD
 *   GET /api/v1/reportes/kpis             — KPIs detallados por proyecto
 *   GET /api/v1/reportes/exportar-excel   — Exporta dashboard a .xlsx
 *
 * RBAC: Admin, Presidente/Gerente, Contador, Auxiliar de Contabilidad
 *
 * Clean Code:
 *   - Separación de responsabilidades: helpers de cálculo aislados
 *   - Uso de Promise.all para consultas paralelas
 *   - Manejo de errores consistente
 */

const router = require('express').Router();
const { requireAuth, requireRole, ROLES } = require('../middlewares/auth.middleware');
const prisma = require('../utils/prisma');

// Roles con acceso al módulo de reportes
const ROLES_REPORTES = [
  ROLES.ADMIN,
  ROLES.PRESIDENTE,
  ROLES.CONTADOR,
  ROLES.AUXILIAR,
];

// ─── Helpers de cálculo ────────────────────────────────────────────────────────

/**
 * Determina si el usuario tiene acceso global (ve todos los proyectos).
 * @param {string} rol
 * @returns {boolean}
 */
const tieneAccesoGlobal = (rol) => {
  const ROLES_GLOBALES = [
    ROLES.ADMIN,
    ROLES.PRESIDENTE,
    ROLES.CONTADOR,
    ROLES.AUXILIAR,
  ];
  return ROLES_GLOBALES.some((r) => r.toLowerCase() === (rol || '').toLowerCase());
};

/**
 * Obtiene los IDs de proyectos a los que el usuario tiene acceso.
 * Si tiene acceso global, retorna null (sin filtro).
 * @param {string} userId
 * @param {string} userRol
 * @returns {Promise<string[] | null>}
 */
const resolverProyectosAccesibles = async (userId, userRol) => {
  if (tieneAccesoGlobal(userRol)) return null;

  const asignaciones = await prisma.asignacionProyectoUsuario.findMany({
    where: { idUsuario: userId },
    select: { idProyecto: true },
  });

  return asignaciones.map((a) => a.idProyecto);
};

/**
 * Calcula KPIs detallados para un proyecto dado.
 * @param {string} idProyecto
 * @returns {Promise<object>}
 */
const calcularKpisProyecto = async (idProyecto) => {
  // Consultas en paralelo para rendimiento
  const [
    proyecto,
    rubros,
    avances,
    requerimientos,
    movimientos,
    inventario,
    cierres,
  ] = await Promise.all([
    prisma.proyecto.findUnique({
      where: { id: idProyecto },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        estado: true,
        presupuestoTotal: true,
        fechaInicio: true,
        fechaFinPrevista: true,
      },
    }),
    prisma.rubro.findMany({
      where: { idProyecto, activo: true },
      select: {
        id: true,
        codigo: true,
        descripcion: true,
        precioUnitario: true,
        cantidadPresupuestada: true,
        cantidadEjecutada: true,
      },
    }),
    prisma.avanceObra.findMany({
      where: { idProyecto },
      select: {
        cantidadAvance: true,
        estado: true,
        idRubro: true,
        fechaRegistro: true,
      },
    }),
    prisma.requerimientoCompra.findMany({
      where: { idProyecto },
      select: {
        estado: true,
        fechaSolicitud: true,
        detalles: { select: { cantidadSolicitada: true, cantidadRecibida: true } },
      },
    }),
    prisma.movimientoInventario.findMany({
      where: { idProyecto },
      select: {
        tipoMovimiento: true,
        cantidad: true,
        fechaMovimiento: true,
      },
    }),
    prisma.inventarioProyecto.findMany({
      where: { idProyecto },
      select: { cantidadDisponible: true },
    }),
    prisma.cierreMensual.findMany({
      where: { idProyecto },
      select: { estadoCierre: true, montoTotal: true, mesAnio: true },
      orderBy: { mesAnio: 'desc' },
    }),
  ]);

  if (!proyecto) return null;

  // ── Cálculos de avance ────────────────────────────────────────────────────
  const presupuestoTotal = parseFloat(proyecto.presupuestoTotal);

  const montoPresupuestadoRubros = rubros.reduce(
    (acc, r) => acc + parseFloat(r.cantidadPresupuestada) * parseFloat(r.precioUnitario),
    0
  );

  // Avances confirmados (SYNCED o VALIDATED)
  const avancesConfirmados = avances.filter(
    (a) => a.estado === 'SYNCED' || a.estado === 'VALIDATED'
  );

  const montoEjecutado = avancesConfirmados.reduce((acc, av) => {
    const rubro = rubros.find((r) => r.id === av.idRubro);
    if (!rubro) return acc;
    return acc + parseFloat(av.cantidadAvance) * parseFloat(rubro.precioUnitario);
  }, 0);

  const porcentajeAvance =
    montoPresupuestadoRubros > 0
      ? Math.min(100, (montoEjecutado / montoPresupuestadoRubros) * 100)
      : 0;

  // ── Cálculos de compras ───────────────────────────────────────────────────
  const totalReq = requerimientos.length;
  const reqAprobados = requerimientos.filter((r) => r.estado === 'APROBADO').length;
  const reqRecibidos = requerimientos.filter((r) => r.estado === 'RECIBIDO').length;
  const reqPendientes = requerimientos.filter((r) => r.estado === 'EN_REVISION').length;

  const montoComprasTotal = requerimientos.reduce(
    (acc, req) =>
      acc +
      req.detalles.reduce((s, d) => s + parseFloat(d.cantidadSolicitada), 0),
    0
  );

  // ── Cálculos de inventario ────────────────────────────────────────────────
  const entradasTotal = movimientos
    .filter((m) => m.tipoMovimiento === 'ENTRADA')
    .reduce((acc, m) => acc + parseFloat(m.cantidad), 0);

  const salidasTotal = movimientos
    .filter((m) => m.tipoMovimiento === 'SALIDA')
    .reduce((acc, m) => acc + parseFloat(m.cantidad), 0);

  const stockTotalDisponible = inventario.reduce(
    (acc, inv) => acc + parseFloat(inv.cantidadDisponible),
    0
  );

  // ── KPI: Días de retraso o adelanto ──────────────────────────────────────
  const hoy = new Date();
  const fechaFin = new Date(proyecto.fechaFinPrevista);
  const diasRestantes = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));

  // ── Cierres contables ─────────────────────────────────────────────────────
  const cierresCerrados = cierres.filter((c) => c.estadoCierre === 'CERRADO');
  const montoTotalCierres = cierresCerrados.reduce(
    (acc, c) => acc + parseFloat(c.montoTotal || 0),
    0
  );

  // ── Presupuesto ejecutado vs disponible ───────────────────────────────────
  const presupuestoEjecutadoPct =
    presupuestoTotal > 0
      ? Math.min(100, (montoEjecutado / presupuestoTotal) * 100)
      : 0;

  return {
    proyecto: {
      id: proyecto.id,
      codigo: proyecto.codigo,
      nombre: proyecto.nombre,
      estado: proyecto.estado,
      presupuestoTotal,
      fechaInicio: proyecto.fechaInicio,
      fechaFinPrevista: proyecto.fechaFinPrevista,
    },
    kpis: {
      // Avance
      porcentajeAvance: parseFloat(porcentajeAvance.toFixed(2)),
      montoEjecutado: parseFloat(montoEjecutado.toFixed(2)),
      montoPresupuestado: parseFloat(montoPresupuestadoRubros.toFixed(2)),
      presupuestoEjecutadoPct: parseFloat(presupuestoEjecutadoPct.toFixed(2)),
      totalRubros: rubros.length,

      // Tiempo
      diasRestantes,
      estaVencido: diasRestantes < 0,

      // Compras
      totalRequerimientos: totalReq,
      reqAprobados,
      reqRecibidos,
      reqPendientes,
      montoComprasTotal: parseFloat(montoComprasTotal.toFixed(2)),

      // Inventario
      entradasTotal: parseFloat(entradasTotal.toFixed(4)),
      salidasTotal: parseFloat(salidasTotal.toFixed(4)),
      stockTotalDisponible: parseFloat(stockTotalDisponible.toFixed(4)),
      totalMovimientos: movimientos.length,

      // Cierres
      totalCierres: cierres.length,
      cierresCerrados: cierresCerrados.length,
      montoTotalCierres: parseFloat(montoTotalCierres.toFixed(2)),
      ultimoCierre: cierres[0]?.mesAnio || null,
    },
  };
};

// ─── GET /api/v1/reportes/dashboard ──────────────────────────────────────────

/**
 * Retorna KPIs reales consolidados de todos los proyectos accesibles.
 * Incluye métricas globales + detalle por proyecto.
 */
router.get('/dashboard', requireAuth, requireRole(ROLES_REPORTES), async (req, res) => {
  try {
    const proyectoIdsAccesibles = await resolverProyectosAccesibles(
      req.user.id,
      req.user.rol
    );

    // Obtener proyectos (todos o filtrados)
    const whereProyectos =
      proyectoIdsAccesibles !== null
        ? { id: { in: proyectoIdsAccesibles } }
        : {};

    const proyectos = await prisma.proyecto.findMany({
      where: whereProyectos,
      select: {
        id: true,
        codigo: true,
        nombre: true,
        estado: true,
        presupuestoTotal: true,
        fechaInicio: true,
        fechaFinPrevista: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!proyectos.length) {
      return res.json({
        success: true,
        proyectos: [],
        consolidaciones: [],
        kpisGlobales: null,
        proyectosKpis: [],
      });
    }

    // Calcular KPIs para cada proyecto en paralelo
    const proyectosKpis = await Promise.all(
      proyectos.map((p) => calcularKpisProyecto(p.id))
    );

    const kpisValidos = proyectosKpis.filter(Boolean);

    // ── Métricas globales (consolidado de todos los proyectos) ────────────
    const kpisGlobales = {
      totalProyectos: proyectos.length,
      proyectosActivos: proyectos.filter((p) => p.estado === 'ACTIVO').length,
      proyectosFinalializados: proyectos.filter((p) => p.estado === 'FINALIZADO').length,
      presupuestoTotalGlobal: proyectos.reduce(
        (acc, p) => acc + parseFloat(p.presupuestoTotal),
        0
      ),
      montoEjecutadoGlobal: kpisValidos.reduce(
        (acc, k) => acc + k.kpis.montoEjecutado,
        0
      ),
      porcentajeAvancePromedio:
        kpisValidos.length > 0
          ? parseFloat(
              (
                kpisValidos.reduce((acc, k) => acc + k.kpis.porcentajeAvance, 0) /
                kpisValidos.length
              ).toFixed(2)
            )
          : 0,
      totalRequerimientos: kpisValidos.reduce(
        (acc, k) => acc + k.kpis.totalRequerimientos,
        0
      ),
      stockTotalSistema: kpisValidos.reduce(
        (acc, k) => acc + k.kpis.stockTotalDisponible,
        0
      ),
      proyectosVencidos: kpisValidos.filter((k) => k.kpis.estaVencido).length,
    };

    // Compatibilidad: construir `consolidaciones` con el formato legacy del frontend
    const consolidaciones = kpisValidos.map((k) => ({
      idCierre: null,
      idProyecto: k.proyecto.id,
      mesAnio: k.kpis.ultimoCierre || new Date().toISOString().slice(0, 7),
      generadoEn: new Date().toISOString(),
      porcentajeAvance: k.kpis.porcentajeAvance,
      totalComprasMonto: k.kpis.montoComprasTotal,
      totalAvanceQty: k.kpis.entradasTotal,
      totalAvanceMonto: k.kpis.montoEjecutado,
    }));

    return res.json({
      success: true,
      proyectos: proyectos.map((p) => ({
        id: p.id,
        name: p.nombre,
        code: p.codigo,
        nombre: p.nombre,
        codigo: p.codigo,
        estado: p.estado,
        presupuestoTotal: parseFloat(p.presupuestoTotal),
        fechaInicio: p.fechaInicio,
        fechaFinPrevista: p.fechaFinPrevista,
      })),
      consolidaciones,
      kpisGlobales,
      proyectosKpis: kpisValidos,
    });
  } catch (error) {
    console.error('[ReportesRouter] GET /dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el dashboard de reportes.',
    });
  }
});

// ─── GET /api/v1/reportes/kpis?idProyecto= ───────────────────────────────────

/**
 * Retorna KPIs detallados de un proyecto específico.
 * Permite drill-down desde el dashboard.
 */
router.get('/kpis', requireAuth, requireRole(ROLES_REPORTES), async (req, res) => {
  try {
    const { idProyecto } = req.query;

    if (!idProyecto) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el parámetro "idProyecto".',
      });
    }

    const kpis = await calcularKpisProyecto(idProyecto);

    if (!kpis) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado.',
      });
    }

    return res.json({ success: true, data: kpis });
  } catch (error) {
    console.error('[ReportesRouter] GET /kpis:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al calcular los KPIs del proyecto.',
    });
  }
});

// ─── GET /api/v1/reportes/exportar-excel ─────────────────────────────────────

/**
 * Exporta el dashboard de KPIs a formato Excel (.xlsx).
 * Genera un libro con hojas: Resumen Global, Detalle por Proyecto, Inventario.
 *
 * Query params opcionales:
 *   ?idProyecto= — Filtra por un proyecto específico
 */
router.get('/exportar-excel', requireAuth, requireRole(ROLES_REPORTES), async (req, res) => {
  try {
    // Lazy-load de ExcelJS para no penalizar el arranque del servidor
    let ExcelJS;
    try {
      ExcelJS = require('exceljs');
    } catch {
      return res.status(503).json({
        success: false,
        message: 'El módulo de exportación Excel no está disponible. Ejecute: npm install exceljs',
      });
    }

    const { idProyecto: filtroProyecto } = req.query;

    const proyectoIdsAccesibles = await resolverProyectosAccesibles(
      req.user.id,
      req.user.rol
    );

    const whereProyectos =
      proyectoIdsAccesibles !== null
        ? { id: { in: proyectoIdsAccesibles } }
        : {};

    if (filtroProyecto) {
      whereProyectos.id = filtroProyecto;
    }

    const proyectos = await prisma.proyecto.findMany({
      where: whereProyectos,
      select: {
        id: true,
        codigo: true,
        nombre: true,
        estado: true,
        presupuestoTotal: true,
        fechaInicio: true,
        fechaFinPrevista: true,
      },
      orderBy: { codigo: 'asc' },
    });

    if (!proyectos.length) {
      return res.status(404).json({
        success: false,
        message: 'No hay proyectos disponibles para exportar.',
      });
    }

    // Calcular KPIs para todos los proyectos
    const proyectosKpis = (
      await Promise.all(proyectos.map((p) => calcularKpisProyecto(p.id)))
    ).filter(Boolean);

    // ── Construir libro Excel ─────────────────────────────────────────────
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema ICARO';
    workbook.created = new Date();

    // Estilos comunes
    const HEADER_FILL = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E79' },
    };
    const HEADER_FONT = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    const TITLE_FONT = { bold: true, size: 14, color: { argb: 'FF1F4E79' } };
    const BORDER_THIN = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    const aplicarEstiloEncabezado = (row) => {
      row.eachCell((cell) => {
        cell.fill = HEADER_FILL;
        cell.font = HEADER_FONT;
        cell.border = BORDER_THIN;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    };

    // ── Hoja 1: Resumen Global ────────────────────────────────────────────
    const wsResumen = workbook.addWorksheet('Resumen Global', {
      views: [{ state: 'frozen', ySplit: 4 }],
    });

    wsResumen.mergeCells('A1:H1');
    const tituloResumen = wsResumen.getCell('A1');
    tituloResumen.value = 'SISTEMA ICARO — Dashboard de KPIs por Proyecto';
    tituloResumen.font = TITLE_FONT;
    tituloResumen.alignment = { horizontal: 'center', vertical: 'middle' };

    wsResumen.mergeCells('A2:H2');
    wsResumen.getCell('A2').value = `Generado: ${new Date().toLocaleString('es-EC')} | Usuario: ${req.user.email}`;
    wsResumen.getCell('A2').font = { italic: true, color: { argb: 'FF666666' }, size: 9 };
    wsResumen.getCell('A2').alignment = { horizontal: 'center' };

    wsResumen.getRow(1).height = 28;
    wsResumen.getRow(2).height = 16;

    const encabezadosResumen = [
      'Código', 'Proyecto', 'Estado', 'Presupuesto Total ($)',
      'Monto Ejecutado ($)', '% Avance', 'Días Restantes', 'Cierres',
    ];
    const rowEncabezadoRes = wsResumen.getRow(4);
    rowEncabezadoRes.values = encabezadosResumen;
    aplicarEstiloEncabezado(rowEncabezadoRes);
    rowEncabezadoRes.height = 22;

    wsResumen.columns = [
      { key: 'codigo', width: 14 },
      { key: 'nombre', width: 32 },
      { key: 'estado', width: 14 },
      { key: 'presupuesto', width: 22 },
      { key: 'ejecutado', width: 22 },
      { key: 'avance', width: 14 },
      { key: 'dias', width: 16 },
      { key: 'cierres', width: 12 },
    ];

    proyectosKpis.forEach((item, idx) => {
      const { proyecto, kpis } = item;
      const row = wsResumen.addRow([
        proyecto.codigo,
        proyecto.nombre,
        proyecto.estado,
        kpis.montoPresupuestado,
        kpis.montoEjecutado,
        kpis.porcentajeAvance / 100,
        kpis.diasRestantes,
        kpis.cierresCerrados,
      ]);

      row.getCell(4).numFmt = '"$"#,##0.00';
      row.getCell(5).numFmt = '"$"#,##0.00';
      row.getCell(6).numFmt = '0.00%';

      const bgColor = idx % 2 === 0 ? 'FFF0F4F8' : 'FFFFFFFF';
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.border = BORDER_THIN;
        cell.alignment = { vertical: 'middle' };
      });

      // Colorear % avance
      const avanceCell = row.getCell(6);
      const pct = kpis.porcentajeAvance;
      if (pct >= 80) {
        avanceCell.font = { color: { argb: 'FF166534' }, bold: true };
      } else if (pct >= 50) {
        avanceCell.font = { color: { argb: 'FF92400E' }, bold: true };
      } else {
        avanceCell.font = { color: { argb: 'FF991B1B' }, bold: true };
      }
    });

    // ── Hoja 2: KPIs Detallados ───────────────────────────────────────────
    const wsDetalle = workbook.addWorksheet('KPIs Detallados', {
      views: [{ state: 'frozen', ySplit: 4 }],
    });

    wsDetalle.mergeCells('A1:L1');
    wsDetalle.getCell('A1').value = 'KPIs Detallados por Proyecto — Sistema ICARO';
    wsDetalle.getCell('A1').font = TITLE_FONT;
    wsDetalle.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    wsDetalle.getRow(1).height = 28;

    const encabezadosDetalle = [
      'Proyecto', 'Estado', '% Avance',
      'Req. Total', 'Req. Aprobados', 'Req. Recibidos', 'Req. Pendientes',
      'Compras Total ($)', 'Entradas Inv.', 'Salidas Inv.', 'Stock Disponible',
      'Días Restantes',
    ];
    const rowEncDet = wsDetalle.getRow(4);
    rowEncDet.values = encabezadosDetalle;
    aplicarEstiloEncabezado(rowEncDet);
    rowEncDet.height = 22;

    wsDetalle.columns = [
      { width: 30 }, { width: 14 }, { width: 12 },
      { width: 12 }, { width: 16 }, { width: 16 }, { width: 16 },
      { width: 18 }, { width: 14 }, { width: 14 }, { width: 16 },
      { width: 14 },
    ];

    proyectosKpis.forEach((item, idx) => {
      const { proyecto, kpis } = item;
      const row = wsDetalle.addRow([
        proyecto.nombre,
        proyecto.estado,
        kpis.porcentajeAvance / 100,
        kpis.totalRequerimientos,
        kpis.reqAprobados,
        kpis.reqRecibidos,
        kpis.reqPendientes,
        kpis.montoComprasTotal,
        kpis.entradasTotal,
        kpis.salidasTotal,
        kpis.stockTotalDisponible,
        kpis.diasRestantes,
      ]);

      row.getCell(3).numFmt = '0.00%';
      row.getCell(8).numFmt = '"$"#,##0.00';

      const bgColor = idx % 2 === 0 ? 'FFF0F4F8' : 'FFFFFFFF';
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.border = BORDER_THIN;
        cell.alignment = { vertical: 'middle' };
      });
    });

    // ── Hoja 3: Metadatos ────────────────────────────────────────────────
    const wsMeta = workbook.addWorksheet('Información');
    wsMeta.getCell('A1').value = 'SISTEMA ICARO — Información del Reporte';
    wsMeta.getCell('A1').font = TITLE_FONT;

    const metaRows = [
      ['Campo', 'Valor'],
      ['Fecha de generación', new Date().toLocaleString('es-EC')],
      ['Generado por', `${req.user.email} (${req.user.rol})`],
      ['Total de proyectos', proyectosKpis.length],
      ['Versión del sistema', '1.0.0 — Sistema ICARO'],
    ];

    metaRows.forEach((row, idx) => {
      const wsRow = wsMeta.addRow(row);
      if (idx === 0) {
        wsRow.eachCell((cell) => {
          cell.fill = HEADER_FILL;
          cell.font = HEADER_FONT;
        });
      }
    });

    wsMeta.getColumn(1).width = 24;
    wsMeta.getColumn(2).width = 40;

    // ── Enviar respuesta ──────────────────────────────────────────────────
    const fechaStr = new Date().toISOString().slice(0, 10);
    const filename = `icaro_dashboard_${fechaStr}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('[ReportesRouter] GET /exportar-excel:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Error al generar el archivo Excel.',
      });
    }
  }
});

module.exports = router;
