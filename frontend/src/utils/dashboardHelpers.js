import { formatReportMetricValue } from './reportHelpers.js';

export function normalizeChartSegments(chart) {
  const maxValue = Math.max(...chart.segments.map((segment) => segment.value), 1);

  return chart.segments.map((segment) => ({
    ...segment,
    percentage: Math.max(8, Math.round((segment.value / maxValue) * 100)),
  }));
}

export function getReportsPartialDataMeta(dataset) {
  if (!dataset?.partialData) {
    return {
      title: 'Los datos del filtro actual están completos',
      description: 'La lectura visible corresponde al corte consolidado del proyecto y periodo seleccionados.',
      tone: 'success',
    };
  }

  return {
    title: 'Algunas métricas no están completamente consolidadas',
    description: 'Revise el proyecto o periodo seleccionado. La pantalla sigue siendo útil, pero parte del corte está en proceso de consolidación.',
    tone: 'warning',
  };
}

export function buildMetricDetailContent(item, contextLabel) {
  if (!item) {
    return null;
  }

  if (item.kind === 'metric') {
    return {
      title: item.label,
      value: formatReportMetricValue(item),
      subtitle: contextLabel,
      description: item.definition,
      note: item.contextNote,
    };
  }

  if (item.kind === 'chart') {
    return {
      title: item.title,
      value: `${item.segments.length} segmentos visibles`,
      subtitle: contextLabel,
      description: item.definition,
      note: item.contextNote,
    };
  }

  return {
    title: item.descripcion,
    value: String(item.valor),
    subtitle: contextLabel,
    description: item.detalle,
    note: item.codigo,
  };
}