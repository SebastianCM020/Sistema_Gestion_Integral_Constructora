import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { AdminErrorState } from '../../components/admin/AdminErrorState.jsx';
import { AdminSectionTabs } from '../../components/admin/AdminSectionTabs.jsx';
import { MaterialHeader } from '../../components/admin/MaterialHeader.jsx';
import { MaterialSummaryCards } from '../../components/admin/MaterialSummaryCards.jsx';
import { MaterialsFilters } from '../../components/admin/MaterialsFilters.jsx';
import { MaterialsTableSkeleton } from '../../components/admin/MaterialsTableSkeleton.jsx';
import { MaterialsTable } from '../../components/admin/MaterialsTable.jsx';
import { MaterialsMobileList } from '../../components/admin/MaterialsMobileList.jsx';
import { MaterialFormModal } from '../../components/admin/MaterialFormModal.jsx';
import { MaterialDetailDrawer } from '../../components/admin/MaterialDetailDrawer.jsx';
import { MaterialStatusModal } from '../../components/admin/MaterialStatusModal.jsx';
// Sprint 6: Se elimina el mock — ahora se consume la API real
import { fetchMateriales, crearMaterial, actualizarMaterial, eliminarMaterial } from '../../services/materiales.service.js';
import { getModulesForUser } from '../../data/icaroData.js';
import {
  defaultMaterialFilters,
  filterMaterials,
  finalizeMaterialSummary,
  getMaterialSummary,
  getMaterialUnits,
  sortMaterials,
} from '../../utils/materialHelpers.js';

export function MaterialsCatalogView({
  currentUser,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
  onOpenAdminSection,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState(defaultMaterialFilters);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAdmin = currentUser.roleId === 'admin' || currentUser.roleName === 'Administrador del Sistema';

  // Sprint 6: Carga desde API real con soloActivos=false para que Admin vea inactivos
  useEffect(() => {
    if (!isAdmin) {
      setLoadStatus('ready');
      return;
    }

    const loadMaterials = async () => {
      setLoadStatus('loading');
      try {
        const result = await fetchMateriales({ soloActivos: false, isOnline: true });
        setMaterials(Array.isArray(result.data) ? result.data : []);
        setLoadStatus('ready');
      } catch (error) {
        console.error('[MaterialsCatalogView] Error cargando materiales:', error);
        setLoadStatus('error');
      }
    };

    loadMaterials();
  }, [isAdmin, retryCount]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const visibleMaterials = useMemo(() => sortMaterials(filterMaterials(materials, filters), filters.sortBy), [materials, filters]);
  const units = useMemo(() => getMaterialUnits(materials), [materials]);
  const summary = useMemo(() => finalizeMaterialSummary(getMaterialSummary(materials)), [materials]);

  const openOverlay = (type, material = null) => {
    setActiveOverlay({ type, material });
  };

  const closeOverlay = () => {
    setActiveOverlay(null);
  };

  const handleFilterChange = (field, value) => {
    setFilters((previousFilters) => ({ ...previousFilters, [field]: value }));
  };

  // Sprint 6: Crear / Editar material con API real
  const handleSaveMaterial = async (values) => {
    try {
      if (activeOverlay?.type === 'edit' && activeOverlay.material) {
        const result = await actualizarMaterial(activeOverlay.material.id, {
          nombre:      values.nombre     ?? values.name,
          categoria:   values.categoria  ?? values.category,
          unidad:      values.unidad     ?? values.unit,
          descripcion: values.descripcion ?? values.description,
        });
        setMaterials((prev) =>
          prev.map((m) => (m.id === result.data.id ? result.data : m))
        );
        setFeedback({ tone: 'success', message: 'Material actualizado correctamente.' });
      } else {
        const result = await crearMaterial({
          codigo:      values.codigo     ?? values.code,
          nombre:      values.nombre     ?? values.name,
          categoria:   values.categoria  ?? values.category,
          unidad:      values.unidad     ?? values.unit,
          descripcion: values.descripcion ?? values.description,
        });
        setMaterials((prev) => [result.data, ...prev]);
        setFeedback({ tone: 'success', message: 'Material creado correctamente.' });
      }
      closeOverlay();
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al guardar el material.';
      setFeedback({ tone: 'error', message: msg });
    }
  };

  // Sprint 6: Activar / Desactivar material con API real (soft-delete o reactivación)
  const handleConfirmStatus = async () => {
    if (!activeOverlay?.material) {
      return;
    }

    const material = activeOverlay.material;
    // Si está activo → desactivar (soft-delete); si está inactivo → reactivar (PUT activo:true)
    const nextActivo = !material.activo;

    try {
      if (nextActivo) {
        // Reactivar: PUT con { activo: true }
        const result = await actualizarMaterial(material.id, { activo: true });
        setMaterials((prev) => prev.map((m) => (m.id === material.id ? { ...m, activo: result.data.activo } : m)));
      } else {
        // Soft-delete: DELETE endpoint
        await eliminarMaterial(material.id);
        setMaterials((prev) => prev.map((m) => (m.id === material.id ? { ...m, activo: false } : m)));
      }
      setFeedback({ tone: 'success', message: `Material ${nextActivo ? 'activado' : 'desactivado'} correctamente.` });
      closeOverlay();
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al cambiar el estado del material.';
      setFeedback({ tone: 'error', message: msg });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader
          currentUser={currentUser}
          currentAreaLabel="Catálogo y materiales"
          onGoHome={onGoHome}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
          onOpenNavigation={() => setMobileNavOpen(true)}
        />

        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation
            modules={modules}
            activeItemId="catalog"
            isOpen={mobileNavOpen}
            currentUser={currentUser}
            onClose={() => setMobileNavOpen(false)}
            onGoHome={onGoHome}
            onOpenModule={onOpenModule}
            onOpenProfile={onOpenProfile}
            onLogout={onLogout}
          />

          <main>
            <section className="rounded-[12px] border border-[#DC2626]/15 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
                <ShieldAlert size={28} />
              </div>
              <h1 className="text-2xl font-semibold text-[#2F3A45]">No tiene acceso a esta sección</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                La gestión del catálogo de materiales es exclusiva del Administrador del Sistema. Vuelva al panel principal para continuar sin perder el contexto de su sesión.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Volver al panel principal</button>
                <button onClick={() => onOpenAdminSection('users')} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50">Ir a administración</button>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const isNoResults = materials.length > 0 && visibleMaterials.length === 0;
  const isTrulyEmpty = materials.length === 0;

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Catálogo y materiales"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="catalog"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0 space-y-6">
          <AdminSectionTabs activeTab="materials" onChange={onOpenAdminSection} />
          <MaterialHeader onGoHome={onGoHome} onGoAdmin={() => onOpenAdminSection('users')} onCreate={() => openOverlay('create')} />

          {feedback ? (
            <div className="rounded-[12px] border border-[#16A34A]/20 bg-[#16A34A]/10 px-4 py-3 text-sm font-medium text-[#166534] shadow-sm">
              {feedback.message}
            </div>
          ) : null}

          {loadStatus === 'loading' ? <MaterialsTableSkeleton /> : null}
          {loadStatus === 'error' ? <AdminErrorState onRetry={() => setRetryCount((value) => value + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              <MaterialSummaryCards summary={summary} />
              <MaterialsFilters
                filters={filters}
                units={units}
                onChange={handleFilterChange}
                onToggleOnlyActive={() => setFilters((previousFilters) => ({ ...previousFilters, onlyActive: !previousFilters.onlyActive }))}
                onReset={() => setFilters(defaultMaterialFilters)}
              />

              <section className="space-y-4">
                <SectionHeader
                  title="Listado de materiales"
                  description="Consulte referencias, unidad, vigencia y acciones del catálogo sin perder el contexto de administración."
                />

                {isTrulyEmpty ? (
                  <EmptyState
                    title="No hay materiales registrados todavía"
                    description="Cree el primer material del catálogo para empezar a ordenar referencias base del sistema."
                    actionLabel="Nuevo material"
                    onAction={() => openOverlay('create')}
                  />
                ) : isNoResults ? (
                  <EmptyState
                    title="No se encontraron materiales con esos filtros"
                    description="Ajuste la búsqueda, revise la vigencia o limpie los filtros para volver al catálogo completo."
                    actionLabel="Limpiar filtros"
                    onAction={() => setFilters(defaultMaterialFilters)}
                  />
                ) : (
                  <>
                    <MaterialsTable materials={visibleMaterials} onView={(material) => openOverlay('detail', material)} onEdit={(material) => openOverlay('edit', material)} onToggleStatus={(material) => openOverlay('status', material)} />
                    <MaterialsMobileList materials={visibleMaterials} onView={(material) => openOverlay('detail', material)} onEdit={(material) => openOverlay('edit', material)} onToggleStatus={(material) => openOverlay('status', material)} />
                  </>
                )}
              </section>
            </>
          ) : null}
        </main>
      </div>

      {activeOverlay?.type === 'create' || activeOverlay?.type === 'edit' ? (
        <MaterialFormModal material={activeOverlay.material ?? null} materials={materials} onCancel={closeOverlay} onSave={handleSaveMaterial} />
      ) : null}

      {activeOverlay?.type === 'detail' && activeOverlay.material ? (
        <MaterialDetailDrawer material={activeOverlay.material} onClose={closeOverlay} onEdit={() => openOverlay('edit', activeOverlay.material)} />
      ) : null}

      {activeOverlay?.type === 'status' && activeOverlay.material ? (
        <MaterialStatusModal material={activeOverlay.material} onCancel={closeOverlay} onConfirm={handleConfirmStatus} />
      ) : null}
    </div>
  );
}