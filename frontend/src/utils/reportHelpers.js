export const reportPeriodsCatalog = [
  { id: '2026-03', label: 'Marzo 2026' },
  { id: '2026-02', label: 'Febrero 2026' },
  { id: '2026-04', label: 'Abril 2026' },
];

export const reportTabsCatalog = {
  manager: { id: 'manager', label: 'Dashboard gerencial', description: 'KPIs consolidados para lectura ejecutiva.' },
  operational: { id: 'operational', label: 'Reporte operativo', description: 'Indicadores de ejecución y frentes activos.' },
  accounting: { id: 'accounting', label: 'Reporte contable', description: 'Cifras del periodo, cartera y conciliaciones.' },
};

export function getAllowedReportTabs(roleName) {
  if (roleName === 'Contador') {
    return ['accounting', 'operational'];
  }

  if (roleName === 'Presidente / Gerente' || roleName === 'Administrador del Sistema') {
    return ['manager', 'operational', 'accounting'];
  }

  return [];
}

export function getDefaultReportTab(roleName) {
  if (roleName === 'Contador') {
    return 'accounting';
  }

  return 'manager';
}

export function buildReportScopeKey(projectId, periodId) {
  return `${projectId}::${periodId}`;
}

export function formatReportUpdatedAt(dateValue) {
  if (!dateValue) {
    return 'Sin actualización visible';
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

export function formatReportMetricValue(metric) {
  if (!metric) {
    return 'Sin dato';
  }

  if (metric.unit === 'currency') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(metric.value);
  }

  if (metric.unit === '%') {
    return `${metric.value}%`;
  }

  if (metric.unit === 'items' || metric.unit === 'registros') {
    return `${metric.value}`;
  }

  return `${metric.value} ${metric.unit}`.trim();
}

export function formatAccountingValue(value, currency = 'COP') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDashboardStatusMeta(status) {
  if (status === 'success') {
    return { label: 'Estable', tone: 'success' };
  }

  if (status === 'info') {
    return { label: 'Monitoreado', tone: 'info' };
  }

  if (status === 'warning') {
    return { label: 'En seguimiento', tone: 'warning' };
  }

  if (status === 'danger') {
    return { label: 'Crítico', tone: 'danger' };
  }

  return { label: 'Sin clasificación', tone: 'neutral' };
}

export function filterReportRowsByDimension(rows, dimensionFilter) {
  if (dimensionFilter === 'all') {
    return rows;
  }

  if (dimensionFilter === 'attention') {
    return rows.filter((row) => ['warning', 'danger'].includes(row.estado));
  }

  if (dimensionFilter === 'stable') {
    return rows.filter((row) => ['success', 'info'].includes(row.estado));
  }

  return rows;
}

export function buildReportsSummaryCards(activeTab, dataset, visibleRows) {
  if (!dataset) {
    return [];
  }

  if (activeTab === 'manager') {
    return [
      { id: 'metrics', label: 'KPIs visibles', value: dataset.metrics.length },
      { id: 'charts', label: 'Gráficos activos', value: dataset.charts.length },
      { id: 'insights', label: 'Insights destacados', value: dataset.insights.length },
      { id: 'partial', label: 'Datos parciales', value: dataset.partialData ? 'Sí' : 'No' },
    ];
  }

  return [
    { id: 'metrics', label: 'Métricas clave', value: dataset.metrics.length },
    { id: 'rows', label: 'Registros visibles', value: visibleRows.length },
    { id: 'alerts', label: 'Hallazgos relevantes', value: dataset.insights.filter((insight) => ['warning', 'danger'].includes(insight.tone)).length },
    { id: 'updated', label: 'Actualizado', value: formatReportUpdatedAt(dataset.updatedAt) },
  ];
}

export function buildReportFilterSummary(activeTab, currentProject, currentPeriod, dimensionFilter) {
  const tabLabel = reportTabsCatalog[activeTab]?.label ?? 'Reporte';
  const dimensionLabel =
    dimensionFilter === 'attention' ? 'solo alertas' : dimensionFilter === 'stable' ? 'solo estables' : 'todas las dimensiones';

  return `${tabLabel} · ${currentProject?.code ?? 'sin proyecto'} · ${currentPeriod?.label ?? 'sin periodo'} · ${dimensionLabel}`;
}