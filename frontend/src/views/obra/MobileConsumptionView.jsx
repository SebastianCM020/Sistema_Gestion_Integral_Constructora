// ─────────────────────────────────────────────────────────────────────────────
// MobileConsumptionView.jsx — Sprint 9: Vista móvil de consumo en obra
//
// HU-S9-1: El Residente solo visualiza y consume materiales de su proyecto
//           autorizado y vigente (datos reales desde el servidor).
// HU-S9-2: Cada consumo válido llama al backend transaccional que descuenta
//           stock y genera un MovimientoInventario tipo SALIDA.
// HU-S9-3: Validaciones de seguridad visibles en la UI:
//           - Stock insuficiente     → modal bloqueante
//           - Proyecto ajeno         → banner de acceso denegado
//           - Concurrencia           → banner de conflicto
// HU-S9-4: Modo offline: guardar en IndexedDB con idempotencyKey y sincronizar
//           mediante el SyncManager cuando se recupera la conexión.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from 'react';
import {
  ShieldAlert, WifiOff, RefreshCw, Clock, CloudOff,
  CheckCircle2, ClipboardPen, X,
} from 'lucide-react';
import { AppHeader }                        from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation }               from '../../components/ui/SidebarNavigation.jsx';
import { EmptyState }                      from '../../components/ui/EmptyState.jsx';
import { AvailableMaterialsList }          from '../../components/obra/AvailableMaterialsList.jsx';
import { ChangeProjectConsumptionModal }   from '../../components/obra/ChangeProjectConsumptionModal.jsx';
import { ConsumptionContextHeader }        from '../../components/obra/ConsumptionContextHeader.jsx';
import { ConsumptionDraftPanel }           from '../../components/obra/ConsumptionDraftPanel.jsx';
import { ConsumptionErrorState }           from '../../components/obra/ConsumptionErrorState.jsx';
import { ConsumptionForm }                 from '../../components/obra/ConsumptionForm.jsx';
import { ConsumptionLoadingState }         from '../../components/obra/ConsumptionLoadingState.jsx';
import { ConsumptionSuccessState }         from '../../components/obra/ConsumptionSuccessState.jsx';
import { ConsumptionSummaryCard }          from '../../components/obra/ConsumptionSummaryCard.jsx';
import { MaterialSearchBar }              from '../../components/obra/MaterialSearchBar.jsx';
import { MaterialStockCard }              from '../../components/obra/MaterialStockCard.jsx';
import { StockInsufficientModal }         from '../../components/obra/StockInsufficientModal.jsx';
import { StockValidationBanner }          from '../../components/obra/StockValidationBanner.jsx';
import { getModulesForUser }             from '../../data/icaroData.js';
import { useConsumptionState }            from '../../hooks/useConsumptionState.js';
// ─────────────────────────────────────────────────────────────────────────────

// ─── Sub-componente: Modal de registro de consumo ────────────────────────────

/**
 * Modal incrustado (overlay) para el formulario de consumo.
 * Se muestra cuando el usuario pulsa "Registrar consumo" sobre un material.
 */
function ConsumptionFormModal({ selectedMaterial, stockValidation, values, errors, hasDraft, isSubmitting, onChangeValue, onSubmit, onReset, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Formulario de registro de consumo">
      <div className="w-full max-w-lg rounded-[16px] bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Cabecera del modal */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#D1D5DB] bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Registrar consumo</p>
            <h2 className="mt-0.5 text-base font-semibold text-[#2F3A45]">
              {selectedMaterial?.code} · {selectedMaterial?.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo: Borrador + Validación de stock + Formulario */}
        <div className="px-5 py-4 space-y-4">
          {hasDraft && (
            <ConsumptionDraftPanel
              selectedMaterial={selectedMaterial}
              values={values}
              onReset={onReset}
            />
          )}
          {selectedMaterial && <StockValidationBanner validation={stockValidation} />}
          <ConsumptionForm
            values={values}
            errors={errors}
            selectedMaterial={selectedMaterial}
            isSubmitting={isSubmitting}
            onChange={onChangeValue}
            onSubmit={onSubmit}
            onReset={onReset}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Componente de historial de consumos ─────────────────────────────────────

/**
 * Lista de consumos realizados en el proyecto actual.
 * Combina registros locales (pendientes) con los sincronizados en el servidor.
 */
function ConsumptionHistoryPanel({ historialConsumos, loadingHistorial }) {
  return (
    <section className="w-full bg-white border border-[#D1D5DB] rounded-[12px] shadow-sm p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-[#2F3A45] mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1F4E79]" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Historial de Consumos Realizados
      </h2>

      {loadingHistorial ? (
        <p className="text-sm text-gray-500 text-center py-4">Cargando historial de consumos...</p>
      ) : historialConsumos.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-[8px] border border-gray-100">
          Aún no hay consumos registrados para este proyecto.
        </p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {historialConsumos.map((consumo) => (
            <ConsumptionHistoryItem key={consumo.id} consumo={consumo} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Fila de un consumo dentro del historial.
 */
function ConsumptionHistoryItem({ consumo }) {
  return (
    <div className="p-3 border border-gray-200 rounded-[8px] hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <span className="font-semibold text-red-600">
          -{consumo.cantidad} {consumo.material?.unidad || ''}
        </span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {new Date(consumo.fechaMovimiento).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>

      <div className="text-sm font-medium text-[#2F3A45] mb-1">
        {consumo.material?.codigo} · {consumo.material?.nombre}
      </div>

      <div className="text-xs text-gray-600 flex justify-between items-center">
        <span>Por: {consumo.usuario ? `${consumo.usuario.nombre} ${consumo.usuario.apellido}` : 'Desconocido'}</span>

        <div className="flex items-center gap-1.5">
          {consumo.sync_status === 'pending' && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <Clock size={12} /> Pendiente
            </span>
          )}
          {consumo.sync_status === 'error' && (
            <span className="flex items-center gap-1 text-red-600 font-medium" title={consumo.sync_error}>
              <CloudOff size={12} /> Error
            </span>
          )}
          {!consumo.sync_status && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <CheckCircle2 size={12} /> Sincronizado
            </span>
          )}
        </div>
      </div>

      {consumo.observacion && (
        <p className="text-xs text-gray-700 italic border-l-2 border-gray-300 pl-2 mt-2">"{consumo.observacion}"</p>
      )}
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export function MobileConsumptionView({
  currentUser,
  isRestricted = false,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule,
}) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const { state, actions } = useConsumptionState(currentUser);

  // Ref para hacer scroll al historial cuando el usuario pulsa "Ver historial completo"
  const historialRef = useRef(null);

  const {
    loadStatus, assignedProjects, currentProjectId,
    loadingMateriales, materialQuery, selectedMaterialId, values,
    errors, submitStatus, submitError, lastRecord, activeOverlay,
    isOffline, pendingSyncCount, activeMaterials, filteredMaterials,
    selectedMaterial, currentProject, stockValidation, hasDraft,
    consumptionSummary, historialConsumos, loadingHistorial,
  } = state;

  const {
    setRetryCount, setMaterialQuery, setSelectedMaterialId,
    handleChangeValue, resetDraft, handleConfirmProject, handleSubmit,
    handleRegisterAnother, handleManualSync, setActiveOverlay, setSubmitStatus, setSubmitError,
  } = actions;

  const modules    = getModulesForUser(currentUser);
  const isResident = currentUser.roleName === 'Residente' && !isRestricted;

  // Determina si el modal de formulario de consumo está abierto
  const isConsumptionFormOpen = activeOverlay?.type === 'consumption-form';

  // Función para abrir el formulario de consumo como modal
  const handleOpenConsumptionForm = () => setActiveOverlay({ type: 'consumption-form' });

  // Cierra el modal de consumo sin resetear el borrador
  const handleCloseConsumptionForm = () => setActiveOverlay(null);

  // Cierra el modal y resetea el borrador del formulario
  const handleCloseAndReset = () => {
    resetDraft();
    setActiveOverlay(null);
  };

  // Wraps el submit: cierra el modal al registrar con éxito
  const handleSubmitAndClose = async (event) => {
    await handleSubmit(event);
    // handleSubmit cambia submitStatus a 'success' si todo va bien;
    // el modal se cierra automáticamente ya que submitStatus === 'success' renderiza el SuccessState
    setActiveOverlay(null);
  };

  // Hace scroll suave al historial de consumos
  const handleScrollToHistory = () => {
    historialRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Consumo en obra"
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onOpenNavigation={() => setMobileNavOpen(true)}
      />

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation
          modules={modules}
          activeItemId="consumption"
          isOpen={mobileNavOpen}
          currentUser={currentUser}
          onClose={() => setMobileNavOpen(false)}
          onGoHome={onGoHome}
          onOpenModule={onOpenModule}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <main className="min-w-0">
          <div className="mx-auto flex max-w-[820px] flex-col gap-5">

            {/* ── Banner de restricción ──────────────────────────────────── */}
            {isRestricted && (
              <div className="flex items-start gap-3 rounded-[10px] border border-amber-200 bg-amber-50 p-4">
                <ShieldAlert size={20} className="shrink-0 text-amber-600" />
                <div className="flex-1 text-sm text-amber-800">
                  Modo de acceso restringido activo. Solo puede consultar información.
                </div>
              </div>
            )}

            {/* ── Banner offline ─────────────────────────────────────────── */}
            {isOffline && (
              <div className="flex flex-col gap-2 rounded-[10px] border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3">
                  <WifiOff size={20} className="shrink-0 text-red-600" />
                  <span className="text-sm font-semibold text-red-800">Trabajando sin conexión</span>
                </div>
                {!isRestricted && (
                  <p className="pl-8 text-xs text-red-700">
                    Sus consumos se guardarán localmente y se sincronizarán automáticamente cuando recupere la conexión.
                  </p>
                )}
              </div>
            )}

            {/* ── Banner de pendientes en línea ──────────────────────────── */}
            {!isOffline && pendingSyncCount > 0 && (
              <div id="pending-sync-banner" className="flex items-center gap-3 rounded-[10px] border border-blue-200 bg-blue-50 px-4 py-3">
                <RefreshCw size={18} className="shrink-0 text-blue-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-blue-800">
                    {pendingSyncCount} consumo{pendingSyncCount !== 1 ? 's' : ''} pendiente{pendingSyncCount !== 1 ? 's' : ''} de sincronizar
                  </span>
                </div>
                <button
                  onClick={handleManualSync}
                  className="shrink-0 rounded-[8px] bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-200"
                >
                  Sincronizar ahora
                </button>
              </div>
            )}

            {/* ── Banner de error de seguridad (HU-S9-3) ────────────────── */}
            {submitStatus === 'error' && submitError && (
              <div
                id="security-error-banner"
                className={`rounded-[10px] border px-4 py-3 ${
                  submitError.code === 'PROYECTO_NO_AUTORIZADO' || submitError.code === 'CONFLICTO_CONCURRENCIA'
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <p className="text-sm font-medium text-red-800">{submitError.message}</p>
                {submitError.code && (
                  <p className="mt-1 text-xs text-red-600">Código: {submitError.code}</p>
                )}
                {submitError.detalle && (
                  <p className="mt-1 text-xs text-red-600">
                    Disponible: {submitError.detalle.stockDisponible} — Solicitado: {submitError.detalle.cantidadSolicitada}
                  </p>
                )}
                <button
                  onClick={() => { setSubmitStatus('idle'); setSubmitError(null); }}
                  className="mt-2 text-xs text-red-700 underline hover:text-red-900"
                >
                  Cerrar
                </button>
              </div>
            )}

            {/* ── Estado de carga inicial ───────────────────────────────── */}
            {loadStatus === 'loading' && <ConsumptionLoadingState />}

            {/* ── Estado de error de carga ──────────────────────────────── */}
            {loadStatus === 'error' && (
              <ConsumptionErrorState
                title="No fue posible cargar el consumo en obra"
                description="Revise la conexión o reintente la carga para recuperar proyectos, materiales y stock disponible."
                onRetry={() => setRetryCount((v) => v + 1)}
                onGoHome={onGoHome}
              />
            )}

            {/* ── Contenido principal ───────────────────────────────────── */}
            {loadStatus === 'ready' && (
              <>
                {/* Cabecera de contexto del proyecto */}
                {assignedProjects.length ? (
                  <ConsumptionContextHeader
                    currentProject={currentProject}
                    hasMultipleProjects={assignedProjects.length > 1}
                    totalAssignedProjects={assignedProjects.length}
                    pendingSyncCount={consumptionSummary.pendingSync}
                    onGoHome={onGoHome}
                    onOpenProjectModal={() => setActiveOverlay({ type: 'change-project' })}
                  />
                ) : (
                  <EmptyState
                    title="No tiene proyectos asignados en este momento"
                    description="Aún no hay proyectos disponibles para registrar consumo. Vuelva al panel principal para continuar."
                    actionLabel="Volver al panel principal"
                    onAction={onGoHome}
                  />
                )}

                {/* Tarjeta de resumen del módulo */}
                {assignedProjects.length ? <ConsumptionSummaryCard summary={consumptionSummary} /> : null}

                {/* Estado sin materiales disponibles */}
                {assignedProjects.length && !activeMaterials.length && !loadingMateriales ? (
                  <EmptyState
                    title="No hay materiales disponibles para este proyecto"
                    description="No hay materiales con stock disponible en el inventario de este proyecto. Cambie de proyecto o contacte al bodeguero."
                    actionLabel={assignedProjects.length > 1 ? 'Cambiar proyecto' : 'Volver al panel principal'}
                    onAction={assignedProjects.length > 1 ? () => setActiveOverlay({ type: 'change-project' }) : onGoHome}
                  />
                ) : null}

                {/* Cargando materiales */}
                {loadingMateriales && (
                  <div className="rounded-[12px] bg-white p-6 shadow-sm text-center text-sm text-gray-500">
                    Cargando materiales disponibles...
                  </div>
                )}

                {/* ── Flujo principal: selección de material y registro ─── */}
                {assignedProjects.length && activeMaterials.length ? (
                  <>
                    {/* Búsqueda y lista de materiales */}
                    <MaterialSearchBar value={materialQuery} onChange={setMaterialQuery} />
                    <AvailableMaterialsList
                      materials={filteredMaterials}
                      selectedMaterialId={selectedMaterialId}
                      onSelect={setSelectedMaterialId}
                      query={materialQuery}
                    />

                    {/* Tarjeta de stock del material seleccionado */}
                    {selectedMaterial ? (
                      <>
                        <MaterialStockCard material={selectedMaterial} />

                        {/* Botón principal para abrir modal de registro */}
                        {submitStatus !== 'success' && (
                          <button
                            type="button"
                            id="btn-abrir-registro-consumo"
                            onClick={handleOpenConsumptionForm}
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#153a5c] transition-colors"
                          >
                            <ClipboardPen size={16} />
                            Registrar consumo de {selectedMaterial.name}
                          </button>
                        )}
                      </>
                    ) : (
                      <EmptyState
                        title="Seleccione un material para continuar"
                        description="El proyecto ya está definido. Elija un material disponible para revisar su stock y registrar el consumo."
                      />
                    )}

                    {/* Estado de éxito tras registrar */}
                    {submitStatus === 'success' && lastRecord ? (
                      <ConsumptionSuccessState
                        record={lastRecord}
                        onRegisterAnother={handleRegisterAnother}
                        onViewHistory={handleScrollToHistory}
                      />
                    ) : null}

                    {/* ── Historial de consumos (siempre visible al fondo) ─ */}
                    <div ref={historialRef}>
                      <ConsumptionHistoryPanel
                        historialConsumos={historialConsumos}
                        loadingHistorial={loadingHistorial}
                      />
                    </div>
                  </>
                ) : null}
              </>
            )}

          </div>
        </main>
      </div>

      {/* ── Modal: cambio de proyecto ─────────────────────────────────────── */}
      {activeOverlay?.type === 'change-project' && (
        <ChangeProjectConsumptionModal
          projects={assignedProjects}
          currentProjectId={currentProjectId}
          hasDraft={hasDraft}
          onCancel={() => setActiveOverlay(null)}
          onConfirm={handleConfirmProject}
        />
      )}

      {/* ── Modal: formulario de registro de consumo ──────────────────────── */}
      {isConsumptionFormOpen && selectedMaterial && (
        <ConsumptionFormModal
          selectedMaterial={selectedMaterial}
          stockValidation={stockValidation}
          values={values}
          errors={errors}
          hasDraft={hasDraft}
          isSubmitting={submitStatus === 'submitting'}
          onChangeValue={handleChangeValue}
          onSubmit={handleSubmitAndClose}
          onReset={handleCloseAndReset}
          onClose={handleCloseConsumptionForm}
        />
      )}

      {/* ── Modal: stock insuficiente ─────────────────────────────────────── */}
      {activeOverlay?.type === 'stock-insufficient' && selectedMaterial && (
        <StockInsufficientModal
          material={selectedMaterial}
          quantity={Number(values.quantity || 0)}
          validation={stockValidation}
          onClose={() => setActiveOverlay(null)}
        />
      )}
    </div>
  );
}