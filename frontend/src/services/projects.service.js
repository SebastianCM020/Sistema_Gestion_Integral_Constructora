import api from '../utils/axios';
import { mockProjects } from '../data/mockProjects';

// ─── Store mock en memoria (imita el patrón de usersApi.js) ─────────────────
let mockStore = [...mockProjects];
let nextMockId = 3000;

const isMockMode = (error) =>
  !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED';

/**
 * Normaliza un proyecto del backend (snake_case / campos API) al formato
 * que esperan filterProjects, sortProjects y ProjectsTable.
 *
 * La UI legacy usa: code, name, description, contractorEntity, contractNumber,
 * totalBudget, startDate, plannedEndDate, status, managerName, idResponsable.
 *
 * El backend devuelve: codigo, nombre, descripcion, entidadContratante,
 * numeroContrato, presupuestoTotal, fechaInicio, fechaFinPrevista, estado, etc.
 */
const normalize = (p) => {
  const rawStatus = (p.status || p.estado || 'active').toLowerCase();
  
  return {
    ...p,
    id:                p.id,
    code:              p.code             ?? p.codigo             ?? '',
    name:              p.name             ?? p.nombre             ?? '',
    description:       p.description      ?? p.descripcion        ?? '',
    contractorEntity:  p.contractorEntity ?? p.entidadContratante ?? '',
    contractNumber:    p.contractNumber   ?? p.numeroContrato     ?? '',
    totalBudget:       p.totalBudget      ?? p.presupuestoTotal   ?? 0,
    startDate:         p.startDate        ?? p.fechaInicio        ?? '',
    plannedEndDate:    p.plannedEndDate   ?? p.fechaFinPrevista   ?? '',
    status:            rawStatus,
    managerName:       p.managerName      ?? (p.responsable ? `${p.responsable.nombre} ${p.responsable.apellido}` : ''),
    idResponsable:     p.idResponsable    ?? p.responsableId       ?? '',
    // Mantener campos originales
    codigo:            p.codigo           ?? p.code               ?? '',
    nombre:            p.nombre           ?? p.name               ?? '',
    estado:            rawStatus.toUpperCase(),
  };
};

/**
 * Traduce el objeto del frontend al formato que espera el Backend (Prisma)
 */
const toBackend = (values) => ({
  codigo:             values.code?.trim().toUpperCase(),
  nombre:             values.name?.trim(),
  descripcion:        values.description?.trim(),
  entidadContratante: values.contractorEntity?.trim(),
  numeroContrato:     values.contractNumber?.trim(),
  presupuestoTotal:   Number(values.totalBudget),
  fechaInicio:        values.startDate,
  fechaFinPrevista:   values.plannedEndDate,
  estado:             (values.status || 'active').toUpperCase(),
  idResponsable:      values.idResponsable || null,
});

// ── GET /proyectos ───────────────────────────────────────────────────────────
export const fetchProjects = async () => {
  try {
    const { data } = await api.get('/proyectos');
    const raw = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    return raw.map(normalize);
  } catch (error) {
    if (isMockMode(error)) {
      console.warn('[projects.service] Backend no disponible — usando datos mock');
      return mockStore.map(normalize);
    }
    throw error;
  }
};

// ── GET /proyectos/:id ───────────────────────────────────────────────────────
export const fetchProjectDetail = async (id) => {
  try {
    const { data } = await api.get(`/proyectos/${id}`);
    return normalize(data.data);
  } catch (error) {
    if (isMockMode(error)) {
      return normalize(mockStore.find((p) => p.id === id) ?? mockStore[0]);
    }
    throw error;
  }
};

// ── POST /proyectos ──────────────────────────────────────────────────────────
export const createProject = async (projectData) => {
  try {
    const payload = toBackend(projectData);
    const { data } = await api.post('/proyectos', payload);
    return normalize(data.data);
  } catch (error) {
    if (isMockMode(error)) {
      const newProject = normalize({
        id: `prj-mock-${++nextMockId}`,
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      mockStore = [newProject, ...mockStore];
      return newProject;
    }
    throw error;
  }
};

// ── PUT /proyectos/:id ───────────────────────────────────────────────────────
export const updateProject = async (id, projectData) => {
  try {
    const payload = toBackend(projectData);
    const { data } = await api.put(`/proyectos/${id}`, payload);
    return normalize(data.data);
  } catch (error) {
    if (isMockMode(error)) {
      mockStore = mockStore.map((p) =>
        p.id === id ? { ...p, ...projectData, updatedAt: new Date().toISOString() } : p
      );
      return normalize(mockStore.find((p) => p.id === id));
    }
    throw error;
  }
};
