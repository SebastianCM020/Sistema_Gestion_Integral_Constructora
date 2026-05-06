import api from '../utils/axios';
import { mockRubros } from '../data/mockRubros';

// ─── Fallback mock store ─────────────────────────────────────────────────────
let mockStore = [...mockRubros];

const isMockMode = (error) =>
  !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED';

/**
 * Normaliza un rubro del backend al formato que usan los helpers de la UI.
 *
 * Backend devuelve:   id, codigo, descripcion, unidad, precioUnitario,
 *                     cantidadPresupuestada, cantidadEjecutada, idProyecto
 * UI helpers esperan: id, code, description, unit, unitPrice,
 *                     budgetedQuantity, executedQuantity, projectId, isActive
 */
const normalize = (r) => ({
  // Campos originales (por si algún componente los lee directamente)
  ...r,
  // Alias para la UI
  code:               r.code              ?? r.codigo              ?? '',
  description:        r.description       ?? r.descripcion         ?? '',
  unit:               r.unit              ?? r.unidad              ?? '',
  unitPrice:          r.unitPrice         ?? r.precioUnitario      ?? 0,
  budgetedQuantity:   r.budgetedQuantity  ?? r.cantidadPresupuestada ?? 0,
  executedQuantity:   r.executedQuantity  ?? r.cantidadEjecutada   ?? 0,
  projectId:          r.projectId         ?? r.idProyecto          ?? '',
  isActive:           r.isActive          ?? r.activo              ?? true,
  source:             r.source            ?? 'manual',
  // También mantener campos backend
  codigo:             r.codigo            ?? r.code               ?? '',
  descripcion:        r.descripcion       ?? r.description        ?? '',
  unidad:             r.unidad            ?? r.unit               ?? '',
  precioUnitario:     r.precioUnitario    ?? r.unitPrice          ?? 0,
  cantidadPresupuestada: r.cantidadPresupuestada ?? r.budgetedQuantity ?? 0,
  cantidadEjecutada:  r.cantidadEjecutada ?? r.executedQuantity   ?? 0,
  idProyecto:         r.idProyecto        ?? r.projectId          ?? '',
});

// ── GET /proyectos/:id  →  extrae rubros del detalle del proyecto ─────────────
export const fetchRubrosByProject = async (projectId) => {
  if (!projectId) return [];
  try {
    const { data } = await api.get(`/proyectos/${projectId}`);
    const raw = data?.data?.rubros;
    if (Array.isArray(raw)) {
      return raw.map((r) =>
        // Inyectamos projectId explícitamente: todos los rubros de esta
        // respuesta pertenecen al proyecto consultado, sin importar si el
        // backend incluyó o no el campo idProyecto en el select.
        normalize({ ...r, idProyecto: projectId })
      );
    }
    return [];
  } catch (error) {
    if (isMockMode(error)) {
      console.warn('[rubros.service] Backend no disponible — usando datos mock');
      return mockStore
        .filter((r) => (r.projectId ?? r.idProyecto) === projectId)
        .map(normalize);
    }
    console.error('[rubros.service] Error en fetchRubrosByProject:', error);
    return [];
  }
};

// ── POST /proyectos/:id/rubros/bulk ──────────────────────────────────────────
export const bulkCreateRubros = async (projectId, rubros) => {
  // Normalizar el payload al formato que espera el backend
  const payload = rubros.map((r) => ({
    codigo:               r.code             ?? r.codigo,
    descripcion:          r.description      ?? r.descripcion,
    unidad:               r.unit             ?? r.unidad,
    precioUnitario:       Number(r.unitPrice ?? r.precioUnitario ?? 0),
    cantidadPresupuestada: Number(r.budgetedQuantity ?? r.cantidadPresupuestada ?? 0),
  }));

  try {
    const { data } = await api.post(`/proyectos/${projectId}/rubros/bulk`, { rubros: payload });
    return data;
  } catch (error) {
    if (isMockMode(error)) {
      console.warn('[rubros.service] Bulk create en modo mock');
      const now = new Date().toISOString();
      const newRubros = payload.map((r, i) => normalize({
        id: `rbr-mock-${Date.now()}-${i}`,
        ...r,
        idProyecto: projectId,
        createdAt: now,
        updatedAt: now,
      }));
      mockStore = [...mockStore, ...newRubros];
      return { count: newRubros.length, message: `${newRubros.length} rubros guardados en mock.` };
    }
    console.error('[rubros.service] Error en bulkCreateRubros:', error);
    throw error;
  }
};

// ── POST /proyectos/:id/rubros ────────────────────────────────────────────────
export const createRubro = async (projectId, rubroData) => {
  const payload = {
    codigo:               (rubroData.code        ?? rubroData.codigo       ?? '').trim().toUpperCase(),
    descripcion:          (rubroData.description  ?? rubroData.descripcion  ?? '').trim(),
    unidad:               (rubroData.unit         ?? rubroData.unidad       ?? '').trim(),
    precioUnitario:       Number(rubroData.unitPrice       ?? rubroData.precioUnitario ?? 0),
    cantidadPresupuestada: Number(rubroData.budgetedQuantity ?? rubroData.cantidadPresupuestada ?? 0),
  };
  try {
    const { data } = await api.post(`/proyectos/${projectId}/rubros`, payload);
    return normalize(data.data);
  } catch (error) {
    if (isMockMode(error)) {
      const newRubro = normalize({
        id: `rbr-mock-${Date.now()}`,
        ...payload,
        idProyecto: projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      mockStore = [newRubro, ...mockStore];
      return newRubro;
    }
    console.error('[rubros.service] Error en createRubro:', error);
    throw error;
  }
};

// ── PUT /proyectos/rubros/:id ─────────────────────────────────────────────────
export const updateRubro = async (rubroId, rubroData) => {
  const payload = {
    codigo:               (rubroData.code        ?? rubroData.codigo       ?? '').trim().toUpperCase(),
    descripcion:          (rubroData.description  ?? rubroData.descripcion  ?? '').trim(),
    unidad:               (rubroData.unit         ?? rubroData.unidad       ?? '').trim(),
    precioUnitario:       Number(rubroData.unitPrice       ?? rubroData.precioUnitario ?? 0),
    cantidadPresupuestada: Number(rubroData.budgetedQuantity ?? rubroData.cantidadPresupuestada ?? 0),
  };
  try {
    const { data } = await api.put(`/proyectos/rubros/${rubroId}`, payload);
    return normalize(data.data);
  } catch (error) {
    if (isMockMode(error)) {
      mockStore = mockStore.map((r) =>
        r.id === rubroId ? { ...r, ...payload, updatedAt: new Date().toISOString() } : r
      );
      return normalize(mockStore.find((r) => r.id === rubroId));
    }
    console.error('[rubros.service] Error en updateRubro:', error);
    throw error;
  }
};

