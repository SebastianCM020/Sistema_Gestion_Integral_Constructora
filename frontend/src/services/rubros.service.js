import api from '../utils/axios';

/**
 * Carga masiva de rubros para un proyecto.
 */
export const bulkCreateRubros = async (projectId, rubros) => {
  try {
    const { data } = await api.post(`/proyectos/${projectId}/rubros/bulk`, { rubros });
    return data;
  } catch (error) {
    console.error('[rubros.service] Error en bulkCreateRubros:', error);
    throw error;
  }
};

/**
 * Obtiene los rubros de un proyecto específico.
 * Nota: Aprovechamos el detalle del proyecto que ya los incluye.
 */
export const fetchRubrosByProject = async (projectId) => {
  try {
    const { data } = await api.get(`/proyectos/${projectId}`);
    return data.data.rubros || [];
  } catch (error) {
    console.error('[rubros.service] Error en fetchRubrosByProject:', error);
    return [];
  }
};
