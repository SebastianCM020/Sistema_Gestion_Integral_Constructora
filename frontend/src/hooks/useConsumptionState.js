import { useState, useMemo, useEffect, useRef } from 'react';
import {
  clearConsumptionForm,
  createConsumptionPayload,
  defaultConsumptionFormValues,
  filterMaterials,
  getConsumptionSummary,
  getSelectedMaterial,
  getSelectedProject,
  hasConsumptionDraft,
  validateConsumptionForm,
} from '../utils/consumptionHelpers.js';
import { getStockValidation } from '../utils/stockValidationHelpers.js';
import { fetchMaterialesDisponibles, registrarConsumoApi, fetchHistorialConsumos } from '../services/consumo.service.js';
import { ejecutarSincronizacion, registrarSyncAutomatico, getPendingCounts } from '../services/syncManager.js';
import { getAllConsumos } from '../db/consumosLocalService.js';

const adaptarMaterialServidor = (item) => ({
  id:                item.idMaterial || item.id,
  code:              item.material?.codigo ?? '',
  name:              item.material?.nombre ?? '',
  unit:              item.material?.unidad ?? '',
  availableQuantity: parseFloat(item.stockDisponible ?? 0),
  active:            item.material?.activo ?? true,
  minimumThreshold:  0,
  warehouseLocation: '',
  lastUpdatedAt:     item.ultimaActualizacion ?? null,
  syncStatus:        'synced',
  idMaterial:        item.idMaterial || item.id,
});

export function useConsumptionState(currentUser) {
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);

  const [assignedProjects, setAssignedProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState('');

  const [materialesByProject, setMaterialesByProject] = useState({});
  const [loadingMateriales, setLoadingMateriales] = useState(false);

  const [materialQuery, setMaterialQuery] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [values, setValues] = useState(defaultConsumptionFormValues);
  const [errors, setErrors] = useState({});
  
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitError, setSubmitError] = useState(null);
  const [lastRecord, setLastRecord] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [consumptionRecords, setConsumptionRecords] = useState([]);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [historialConsumos, setHistorialConsumos] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const cleanupSyncRef = useRef(null);

  const activeMaterials = useMemo(
    () => (materialesByProject[currentProjectId] ?? []).filter((m) => m.active),
    [materialesByProject, currentProjectId]
  );
  
  const filteredMaterials = useMemo(
    () => filterMaterials(activeMaterials, materialQuery),
    [activeMaterials, materialQuery]
  );
  
  const selectedMaterial = useMemo(
    () => getSelectedMaterial(activeMaterials, selectedMaterialId),
    [activeMaterials, selectedMaterialId]
  );
  
  const currentProject = useMemo(
    () => getSelectedProject(assignedProjects, currentProjectId),
    [assignedProjects, currentProjectId]
  );
  
  const stockValidation = useMemo(
    () => getStockValidation(selectedMaterial, values.quantity),
    [selectedMaterial, values.quantity]
  );
  
  const hasDraft = hasConsumptionDraft(values, selectedMaterialId);

  const consumptionSummary = useMemo(
    () => ({
      assignedProjects: assignedProjects.length,
      availableMaterials: activeMaterials.length,
      pendingSync: pendingSyncCount,
      todayConsumption: '—',
    }),
    [assignedProjects.length, activeMaterials.length, pendingSyncCount]
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      if (cleanupSyncRef.current) cleanupSyncRef.current();
      return;
    }
    const intervalId = registrarSyncAutomatico(async () => {
      const resumen = await ejecutarSincronizacion();
      if (resumen.synced > 0) {
        if (currentProjectId) cargarMateriales(currentProjectId);
        actualizarPendientes();
      }
    });
    cleanupSyncRef.current = () => clearInterval(intervalId);
    return () => clearInterval(intervalId);
  }, [isOffline, currentProjectId]);

  const actualizarPendientes = async () => {
    try {
      const { total } = await getPendingCounts();
      setPendingSyncCount(total);
    } catch {}
  };

  useEffect(() => {
    let cancelled = false;
    const cargarProyectos = async () => {
      setLoadStatus('loading');
      try {
        if (!navigator.onLine) {
          setLoadStatus('error');
          return;
        }
        const projectsService = await import('../services/projects.service.js');
        const resp = await projectsService.fetchProyectosAsignados?.();
        if (cancelled) return;

        if (resp?.data?.length > 0) {
          const proyectosAdaptados = resp.data.map((p) => ({
            id: p.id,
            code: p.codigo,
            name: p.nombre,
            startDate: p.fechaInicio,
            endDate: p.fechaFinPrevista,
            accessMode: 'full',
          }));
          setAssignedProjects(proyectosAdaptados);
          setCurrentProjectId(proyectosAdaptados[0]?.id ?? '');
        } else {
          setAssignedProjects([]);
        }
        setLoadStatus('ready');
      } catch (error) {
        if (cancelled) return;
        try {
          const { getAssignedProjectsForUser } = await import('../data/mockAssignedProjects.js');
          const proyectosMock = getAssignedProjectsForUser(currentUser.email);
          if (!cancelled) {
            setAssignedProjects(proyectosMock);
            setCurrentProjectId(proyectosMock[0]?.id ?? '');
            setLoadStatus('ready');
          }
        } catch {
          if (!cancelled) setLoadStatus('error');
        }
      }
      actualizarPendientes();
    };
    cargarProyectos();
    return () => { cancelled = true; };
  }, [retryCount, currentUser.email]);

  const cargarMateriales = async (idProyecto) => {
    if (!idProyecto) return;
    setLoadingMateriales(true);
    try {
      const resp = await fetchMaterialesDisponibles(idProyecto, navigator.onLine);
      const materialesAdaptados = (resp.data ?? []).map(adaptarMaterialServidor);
      setMaterialesByProject((prev) => ({
        ...prev,
        [idProyecto]: materialesAdaptados,
      }));
    } catch (error) {
      const { mockInventoryByProject } = await import('../data/mockInventoryByProject.js');
      if (mockInventoryByProject[idProyecto]) {
        setMaterialesByProject((prev) => ({
          ...prev,
          [idProyecto]: mockInventoryByProject[idProyecto],
        }));
      } else {
        setMaterialesByProject((prev) => ({ ...prev, [idProyecto]: [] }));
      }
    } finally {
      setLoadingMateriales(false);
    }
  };
  
  const cargarHistorial = async (idProyecto) => {
    if (!idProyecto) {
      setHistorialConsumos([]);
      return;
    }
    setLoadingHistorial(true);
    try {
      // 1. Obtener historial del servidor
      const serverResp = await fetchHistorialConsumos(idProyecto, { isOnline: navigator.onLine });
      const serverData = serverResp?.data ?? [];

      // 2. Obtener consumos locales de este proyecto
      const allLocal = await getAllConsumos(idProyecto);
      const localPendientes = allLocal.filter(c => c.sync_status !== 'synced');

      // 3. Enriquecer locales con la información del material
      let materialesDelProyecto = materialesByProject[idProyecto] || [];
      if (materialesDelProyecto.length === 0) {
        try {
          const { mockInventoryByProject } = await import('../data/mockInventoryByProject.js');
          const mocks = mockInventoryByProject[idProyecto] || [];
          materialesDelProyecto = mocks.map(m => ({
            id: m.id || m.idMaterial,
            name: m.name || m.material?.nombre,
            code: m.code || m.material?.codigo,
            unit: m.unit || m.material?.unidad,
          }));
        } catch {}
      }

      const localesEnriquecidos = localPendientes.map(loc => {
        const mat = materialesDelProyecto.find(m => m.id === loc.idMaterial);
        return {
          id: loc.id,
          cantidad: loc.cantidad,
          observacion: loc.observacion,
          fechaMovimiento: loc.local_created_at,
          sync_status: loc.sync_status,
          sync_error: loc.sync_error,
          material: mat ? {
            nombre: mat.name || mat.material?.nombre,
            codigo: mat.code || mat.material?.codigo,
            unidad: mat.unit || mat.material?.unidad
          } : {
            nombre: 'Material',
            codigo: '',
            unidad: ''
          },
          usuario: {
            nombre: currentUser?.nombre ?? 'Usted',
            apellido: currentUser?.apellido ?? '(Local)'
          }
        };
      });

      // 4. Combinar locales (primero) con los del servidor
      setHistorialConsumos([...localesEnriquecidos, ...serverData]);
    } catch (err) {
      console.error('[useConsumptionState] Error al cargar historial de consumos:', err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  useEffect(() => {
    if (currentProjectId) {
      cargarMateriales(currentProjectId);
      setSelectedMaterialId('');
      setMaterialQuery('');
      cargarHistorial(currentProjectId);
    }
  }, [currentProjectId]);

  useEffect(() => {
    if (!activeMaterials.length) {
      setSelectedMaterialId('');
      return;
    }
    if (activeMaterials.length === 1) {
      setSelectedMaterialId(activeMaterials[0].id);
      return;
    }
    if (!activeMaterials.some((m) => m.id === selectedMaterialId)) {
      setSelectedMaterialId('');
    }
  }, [activeMaterials, selectedMaterialId]);

  const resetDraft = () => {
    setValues(clearConsumptionForm());
    setErrors({});
    setSubmitStatus('idle');
    setSubmitError(null);
  };

  const handleChangeValue = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setSubmitError(null);
    }
  };

  const handleConfirmProject = (nextProjectId) => {
    setCurrentProjectId(nextProjectId);
    setSelectedMaterialId('');
    setMaterialQuery('');
    setValues(clearConsumptionForm());
    setErrors({});
    setSubmitStatus('idle');
    setSubmitError(null);
    setActiveOverlay(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateConsumptionForm({
      projectId: currentProjectId,
      materialId: selectedMaterialId,
      quantity: values.quantity,
    });

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    if (stockValidation.status === 'block') {
      setActiveOverlay({ type: 'stock-insufficient' });
      return;
    }

    setSubmitStatus('submitting');
    setSubmitError(null);

    try {
      const resultado = await registrarConsumoApi({
        idProyecto: currentProjectId,
        idMaterial: selectedMaterialId,
        idUsuario: currentUser.id,
        cantidad: Number(values.quantity),
        observacion: values.observations?.trim() || '',
        isOnline: navigator.onLine,
      });

      if (!resultado.success) {
        setSubmitError({ message: resultado.message, code: resultado.code, detalle: resultado.detalle });
        setSubmitStatus('error');
        return;
      }

      const nextRecord = createConsumptionPayload({ project: currentProject, material: selectedMaterial, values });
      if (resultado.offline) {
        nextRecord.syncStatus = 'pending';
        nextRecord.offline = true;
      } else {
        nextRecord.syncStatus = 'synced';
        nextRecord.serverId = resultado.data?.id;
        nextRecord.stockActual = resultado.stockActual;
      }

      setConsumptionRecords((prev) => [nextRecord, ...prev]);
      setLastRecord(nextRecord);

      if (resultado.stockActual !== undefined) {
        setMaterialesByProject((prev) => ({
          ...prev,
          [currentProjectId]: (prev[currentProjectId] ?? []).map((m) =>
            m.id === selectedMaterialId ? { ...m, availableQuantity: resultado.stockActual } : m
          ),
        }));
      }

      actualizarPendientes();
      cargarHistorial(currentProjectId);
      setValues(clearConsumptionForm());
      setErrors({});
      setSubmitStatus('success');
    } catch (fatalError) {
      setSubmitError({ message: 'Error inesperado. Reintente la operación.' });
      setSubmitStatus('error');
    }
  };

  const handleRegisterAnother = () => {
    setSubmitStatus('idle');
    setValues(clearConsumptionForm());
    setErrors({});
    setSubmitError(null);
    if (currentProjectId) {
      cargarMateriales(currentProjectId);
      cargarHistorial(currentProjectId);
    }
  };

  const handleManualSync = async () => {
    const resumen = await ejecutarSincronizacion();
    if (resumen.synced > 0 && currentProjectId) {
      cargarMateriales(currentProjectId);
      cargarHistorial(currentProjectId);
    }
    actualizarPendientes();
  };

  return {
    state: {
      loadStatus, retryCount, assignedProjects, currentProjectId,
      loadingMateriales, materialQuery, selectedMaterialId, values,
      errors, submitStatus, submitError, lastRecord, activeOverlay,
      isOffline, pendingSyncCount, activeMaterials, filteredMaterials,
      selectedMaterial, currentProject, stockValidation, hasDraft,
      consumptionSummary, historialConsumos, loadingHistorial
    },
    actions: {
      setMobileNavOpen: () => {}, // Handled in component
      setRetryCount, setMaterialQuery, setSelectedMaterialId,
      handleChangeValue, resetDraft, handleConfirmProject, handleSubmit,
      handleRegisterAnother, handleManualSync, setActiveOverlay, setSubmitStatus, setSubmitError,
      cargarHistorial
    }
  };
}
