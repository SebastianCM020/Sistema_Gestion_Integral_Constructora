import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistroAvanceMobile from '../../components/avances/RegistroAvanceMobile';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { registrarAvanceApi } from '../../services/offlineSyncService';
import { fetchProjects } from '../../services/projects.service';
import { fetchRubrosByProject } from '../../services/rubros.service';
import { AuthContext } from '../../store/AuthContext';
import { AppHeader } from '../../components/ui/AppHeader';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation';
import { getModulesForUser, getUserFromEmail } from '../../data/icaroData';
import { ChevronRight } from 'lucide-react';

export const RegistroAvanceView = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState('');
  // rubrosCache guarda los rubros en memoria para no perderlos al re-render
  const [rubrosCache, setRubrosCache] = useState({});
  const [rubros, setRubros] = useState([]);
  const [selectedRubroId, setSelectedRubroId] = useState('');
  // Mantener el rubro seleccionado actualizado localmente sin borrar la lista
  const [rubroActual, setRubroActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentUser = {
    ...getUserFromEmail(user.email, user.rol),
    name: `${user.nombre} ${user.apellido}`,
    initials: `${user.nombre[0] || ''}${user.apellido[0] || ''}`.toUpperCase(),
  };

  const modules = getModulesForUser(currentUser);

  // Forzar fondo claro al montar la vista
  useEffect(() => {
    document.body.style.backgroundColor = '#F7F9FC';
    loadProyectos();
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const loadProyectos = async () => {
    try {
      setLoading(true);
      const data = await fetchProjects();
      setProyectos(data || []);
    } catch (err) {
      setError('No se pudieron cargar los proyectos. Verifique su conexión.');
      console.error('[RegistroAvanceView] Error al cargar proyectos:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga rubros del proyecto. Usa caché en memoria para:
   * 1) No perder la lista al re-render después de guardar
   * 2) Evitar parpadeo al re-seleccionar el mismo proyecto
   */
  const loadRubros = useCallback(async (idProyecto, force = false) => {
    // Si ya tenemos en caché y no es recarga forzada, úsalos directamente
    if (!force && rubrosCache[idProyecto]) {
      setRubros(rubrosCache[idProyecto]);
      return;
    }
    try {
      const data = await fetchRubrosByProject(idProyecto);
      const listaRubros = data || [];
      // Guardar en caché
      setRubrosCache(prev => ({ ...prev, [idProyecto]: listaRubros }));
      setRubros(listaRubros);
    } catch (err) {
      console.error('[RegistroAvanceView] Error al cargar rubros:', err);
      // Si tenemos caché anterior, no la borramos — degradación elegante
      if (rubrosCache[idProyecto]) {
        setRubros(rubrosCache[idProyecto]);
      }
    }
  }, [rubrosCache]);

  const handleProyectoChange = (e) => {
    const pId = e.target.value;
    setSelectedProyecto(pId);
    setSelectedRubroId('');
    setRubroActual(null);
    if (pId) {
      loadRubros(pId);
    } else {
      setRubros([]);
    }
  };

  const handleRubroChange = (e) => {
    const rId = e.target.value;
    setSelectedRubroId(rId);
    const found = rubros.find(r => r.id === rId);
    setRubroActual(found ? { ...found, idProyecto: selectedProyecto } : null);
  };

  /**
   * Al guardar un avance:
   * 1) Llamamos a la API (online) o IndexedDB (offline)
   * 2) Si fue exitoso, recargamos los rubros en modo forzado para actualizar cantidadEjecutada
   * 3) Actualizamos el rubroActual localmente para que el pendiente se vea de inmediato
   *    sin esperar a que el estado de rubros se reconstruya
   * 4) NO borramos selectedRubroId para que el formulario siga visible
   */
  const handleGuardar = async (payload) => {
    const result = await registrarAvanceApi(payload);
    if (result && result.success && !result.offline) {
      // Recarga forzada para obtener cantidadEjecutada actualizada desde BD
      const dataActualizada = await fetchRubrosByProject(selectedProyecto).catch(() => null);
      if (dataActualizada) {
        const listaActualizada = dataActualizada || [];
        setRubrosCache(prev => ({ ...prev, [selectedProyecto]: listaActualizada }));
        setRubros(listaActualizada);
        // Actualizar el rubro actual en memoria también
        const rubroActualizadoBD = listaActualizada.find(r => r.id === payload.idRubro);
        if (rubroActualizadoBD) {
          setRubroActual({ ...rubroActualizadoBD, idProyecto: selectedProyecto });
        }
      }
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827] overflow-x-hidden">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Avance Físico de Obra"
        onGoHome={() => navigate('/dashboard')}
        onOpenProfile={() => navigate('/module/profile')}
        onLogout={logout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />
      
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="progress"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={() => navigate('/dashboard')}
          onOpenModule={(id) => navigate(`/module/${id}`)}
          onOpenProfile={() => navigate('/module/profile')}
          onLogout={logout}
        />

        <main className="space-y-6 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-[#1F4E79]">Panel principal</button>
            <ChevronRight size={14} />
            <span className="font-medium text-[#1F4E79]">Avance Físico de Obra</span>
          </div>

          <div className="w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-[#2F3A45]">Registro en Campo</h1>
              <p className="text-gray-500 mt-1 text-sm">Módulo exclusivo para Residentes de Obra.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-[12px] mb-6 text-sm flex items-center justify-between gap-4">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={loadProyectos}
                  className="shrink-0 text-xs font-semibold underline hover:no-underline"
                >
                  Reintentar
                </button>
              </div>
            )}

            <div className="flex flex-col xl:flex-row gap-6 items-start">
              {/* Panel izquierdo: Selectores */}
              <div className="w-full xl:w-[45%] bg-white border border-[#D1D5DB] rounded-[12px] p-5 shadow-sm shrink-0">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#2F3A45] mb-2 block">
                      Proyecto Activo
                    </label>
                    {loading ? (
                      <div className="w-full h-[44px] bg-gray-100 rounded-[10px] animate-pulse" />
                    ) : (
                      <select
                        value={selectedProyecto}
                        onChange={handleProyectoChange}
                        className="w-full h-[44px] px-3 rounded-[10px] bg-white text-[#111827] border border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79] focus:outline-none transition-all text-sm appearance-none"
                      >
                        <option value="">-- Seleccione un Proyecto --</option>
                        {proyectos.map(p => (
                          <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {selectedProyecto && (
                    <div>
                      <label className="text-sm font-medium text-[#2F3A45] mb-2 block">
                        Rubro a Ejecutar
                        <span className="ml-2 text-xs text-gray-400 font-normal">
                          ({rubros.length} disponibles)
                        </span>
                      </label>
                      <select
                        value={selectedRubroId}
                        onChange={handleRubroChange}
                        className="w-full h-[44px] px-3 rounded-[10px] bg-white text-[#111827] border border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79] focus:outline-none transition-all text-sm appearance-none"
                      >
                        <option value="">-- Seleccione un Rubro --</option>
                        {rubros.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.codigo} - {r.descripcion} ({r.unidad})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Indicador de modo offline */}
                  {!navigator.onLine && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-[8px] text-xs text-amber-700">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
                      </svg>
                      <span>Modo sin conexión — Los registros se sincronizarán al volver a estar en línea.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel derecho: Formulario e Historial */}
              <div className="w-full">
                {!loading && !rubroActual && selectedProyecto && (
                  <div className="bg-white border border-dashed border-[#D1D5DB] rounded-[12px] p-8 text-center text-gray-400 text-sm">
                    Seleccione un rubro del listado para comenzar el registro.
                  </div>
                )}
                {rubroActual && (
                  <ErrorBoundary>
                    <RegistroAvanceMobile
                      rubro={rubroActual}
                      onGuardar={handleGuardar}
                    />
                  </ErrorBoundary>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
