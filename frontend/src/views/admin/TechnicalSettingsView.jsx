import React, { useEffect, useMemo, useState } from 'react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { AccessDeniedState } from '../../components/system/AccessDeniedState.jsx';
import { FormValidationSummary } from '../../components/system/FormValidationSummary.jsx';
import { TechnicalSettingsHeader } from '../../components/admin/TechnicalSettingsHeader.jsx';
import { TechnicalSettingsTabs } from '../../components/admin/TechnicalSettingsTabs.jsx';
import { SystemParametersPanel } from '../../components/admin/SystemParametersPanel.jsx';
import { AuxiliaryCatalogsPanel } from '../../components/admin/AuxiliaryCatalogsPanel.jsx';
import { AdminAdjustmentsPanel } from '../../components/admin/AdminAdjustmentsPanel.jsx';
import { SaveSettingsBar } from '../../components/admin/SaveSettingsBar.jsx';
import { SettingsConflictBanner } from '../../components/admin/SettingsConflictBanner.jsx';
import { ResetSectionModal } from '../../components/admin/ResetSectionModal.jsx';
import { UnsavedSettingsModal } from '../../components/admin/UnsavedSettingsModal.jsx';
import { TechnicalSettingDetailDrawer } from '../../components/admin/TechnicalSettingDetailDrawer.jsx';
import { SettingsSummaryCards } from '../../components/admin/SettingsSummaryCards.jsx';
import { EmptySettingsState } from '../../components/admin/EmptySettingsState.jsx';
import { TechnicalSettingsLoadingState } from '../../components/admin/TechnicalSettingsLoadingState.jsx';
import { TechnicalSettingsErrorState } from '../../components/admin/TechnicalSettingsErrorState.jsx';
import { SettingsSuccessState } from '../../components/admin/SettingsSuccessState.jsx';
import { AuxCatalogFormModal } from '../../components/admin/AuxCatalogFormModal.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import { mockAdministrativeAdjustments, mockTechnicalSettings, technicalSettingsTabs } from '../../data/mockTechnicalSettings.js';
import { mockAuxCatalogs } from '../../data/mockAuxCatalogs.js';
import { buildCatalogItemPayload, buildCatalogSummary, cloneAuxCatalogs, countPendingCatalogChanges, filterCatalogItems, sortCatalogItems, validateCatalogItem } from '../../utils/auxCatalogHelpers.js';
import { buildSavePayload, buildSettingsSummary, buildValidationSummary, cloneSettingsCollection, countPendingSettingChanges, getSettingsConflicts, groupSettingsByGroup, normalizeSettingInput, validateSettingsCollection } from '../../utils/technicalSettingsHelpers.js';

const initialCatalogFormState = {
  itemCode: '',
  itemLabel: '',
  isActive: true,
  sortOrder: 0,
};

function formatTimestamp(value) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function getSectionLabel(tab) {
  return technicalSettingsTabs.find((item) => item.id === tab)?.label ?? 'Configuración técnica';
}

export function TechnicalSettingsView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState('parameters');
  const [savedSettings, setSavedSettings] = useState(() => cloneSettingsCollection(mockTechnicalSettings));
  const [draftSettings, setDraftSettings] = useState(() => cloneSettingsCollection(mockTechnicalSettings));
  const [savedAdjustments, setSavedAdjustments] = useState(() => cloneSettingsCollection(mockAdministrativeAdjustments));
  const [draftAdjustments, setDraftAdjustments] = useState(() => cloneSettingsCollection(mockAdministrativeAdjustments));
  const [savedCatalogs, setSavedCatalogs] = useState(() => cloneAuxCatalogs(mockAuxCatalogs));
  const [draftCatalogs, setDraftCatalogs] = useState(() => cloneAuxCatalogs(mockAuxCatalogs));
  const [settingsErrors, setSettingsErrors] = useState({});
  const [adjustmentErrors, setAdjustmentErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle');
  const [activeDrawerItem, setActiveDrawerItem] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState(mockAuxCatalogs[0]?.catalogId ?? null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogFormValues, setCatalogFormValues] = useState(initialCatalogFormState);
  const [catalogFormErrors, setCatalogFormErrors] = useState({});
  const [editingCatalogItemId, setEditingCatalogItemId] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAdmin = currentUser.roleName === 'Administrador del Sistema';

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.adminUsersShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.adminUsersShouldFail, retryCount]);

  const groupedSettings = useMemo(() => groupSettingsByGroup(draftSettings), [draftSettings]);
  const selectedCatalog = useMemo(() => draftCatalogs.find((catalog) => catalog.catalogId === selectedCatalogId) ?? draftCatalogs[0] ?? null, [draftCatalogs, selectedCatalogId]);
  const visibleCatalogItems = useMemo(() => sortCatalogItems(filterCatalogItems(selectedCatalog?.items ?? [], catalogSearch)), [selectedCatalog, catalogSearch]);
  const conflicts = useMemo(() => getSettingsConflicts(draftSettings, draftAdjustments), [draftSettings, draftAdjustments]);

  const pendingSettingChanges = countPendingSettingChanges(savedSettings, draftSettings);
  const pendingAdjustmentChanges = countPendingSettingChanges(savedAdjustments, draftAdjustments);
  const pendingCatalogChanges = countPendingCatalogChanges(savedCatalogs, draftCatalogs);
  const totalPendingChanges = pendingSettingChanges + pendingAdjustmentChanges + pendingCatalogChanges;
  const catalogSummary = buildCatalogSummary(draftCatalogs);
  const summaryCards = buildSettingsSummary({ settings: draftSettings, catalogs: draftCatalogs, adjustments: draftAdjustments, pendingChanges: totalPendingChanges, conflicts });
  const activeTabLabel = getSectionLabel(activeTab);
  const latestUpdatedAt = useMemo(() => {
    const dates = [...draftSettings, ...draftAdjustments, ...draftCatalogs].map((item) => item.updatedAt).filter(Boolean);
    return dates.sort().reverse()[0] ?? new Date().toISOString();
  }, [draftSettings, draftAdjustments, draftCatalogs]);

  const validationSummary = [
    ...buildValidationSummary(settingsErrors, draftSettings),
    ...buildValidationSummary(adjustmentErrors, draftAdjustments),
  ];

  const openCatalogModal = (mode, item = null) => {
    setEditingCatalogItemId(item?.itemId ?? null);
    setCatalogFormValues(item ? {
      itemCode: item.itemCode ?? '',
      itemLabel: item.itemLabel,
      isActive: item.isActive,
      sortOrder: item.sortOrder ?? 0,
    } : initialCatalogFormState);
    setCatalogFormErrors({});
    setActiveModal(mode);
  };

  const handleSettingChange = (setting, rawValue) => {
    const nextValue = normalizeSettingInput(setting, rawValue);
    setDraftSettings((currentCollection) => currentCollection.map((item) => item.settingKey === setting.settingKey ? { ...item, currentValue: nextValue } : item));
    setSettingsErrors((currentErrors) => ({ ...currentErrors, [setting.settingKey]: undefined }));
    setSaveStatus('idle');
  };

  const handleAdjustmentChange = (setting, rawValue) => {
    const nextValue = normalizeSettingInput(setting, rawValue);
    setDraftAdjustments((currentCollection) => currentCollection.map((item) => item.settingKey === setting.settingKey ? { ...item, currentValue: nextValue } : item));
    setAdjustmentErrors((currentErrors) => ({ ...currentErrors, [setting.settingKey]: undefined }));
    setSaveStatus('idle');
  };

  const handleResetSection = () => {
    if (activeTab === 'parameters') {
      setDraftSettings(cloneSettingsCollection(savedSettings));
      setSettingsErrors({});
    }

    if (activeTab === 'catalogs') {
      setDraftCatalogs(cloneAuxCatalogs(savedCatalogs));
      setCatalogSearch('');
      setSelectedCatalogId(savedCatalogs[0]?.catalogId ?? null);
    }

    if (activeTab === 'adjustments') {
      setDraftAdjustments(cloneSettingsCollection(savedAdjustments));
      setAdjustmentErrors({});
    }

    setActiveModal(null);
    setSaveStatus('idle');
  };

  const handleSave = () => {
    const nextSettingErrors = validateSettingsCollection(draftSettings);
    const nextAdjustmentErrors = validateSettingsCollection(draftAdjustments);

    setSettingsErrors(nextSettingErrors);
    setAdjustmentErrors(nextAdjustmentErrors);

    if (Object.keys(nextSettingErrors).length || Object.keys(nextAdjustmentErrors).length || conflicts.length) {
      setSaveStatus('validation-error');
      return;
    }

    setSaveStatus('saving');

    window.setTimeout(() => {
      const savedAt = new Date().toISOString();
      const normalizedSettings = draftSettings.map((item) => ({ ...item, updatedAt: savedAt, updatedBy: currentUser.name }));
      const normalizedAdjustments = draftAdjustments.map((item) => ({ ...item, updatedAt: savedAt, updatedBy: currentUser.name }));
      const normalizedCatalogs = draftCatalogs.map((catalog) => ({ ...catalog, updatedAt: savedAt, updatedBy: currentUser.name }));

      setSavedSettings(cloneSettingsCollection(normalizedSettings));
      setDraftSettings(cloneSettingsCollection(normalizedSettings));
      setSavedAdjustments(cloneSettingsCollection(normalizedAdjustments));
      setDraftAdjustments(cloneSettingsCollection(normalizedAdjustments));
      setSavedCatalogs(cloneAuxCatalogs(normalizedCatalogs));
      setDraftCatalogs(cloneAuxCatalogs(normalizedCatalogs));
      setSaveStatus('saved');
      buildSavePayload({ settings: normalizedSettings, adjustments: normalizedAdjustments, catalogs: normalizedCatalogs });
    }, 900);
  };

  const handleGoHome = () => {
    if (totalPendingChanges) {
      setActiveModal('unsaved-exit');
      return;
    }

    onGoHome();
  };

  const handleSaveCatalogItem = () => {
    if (!selectedCatalog) {
      return;
    }

    const nextErrors = validateCatalogItem(catalogFormValues, selectedCatalog);
    setCatalogFormErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const payload = buildCatalogItemPayload(selectedCatalog, catalogFormValues, selectedCatalog.items.find((item) => item.itemId === editingCatalogItemId));
    setDraftCatalogs((currentCatalogs) => currentCatalogs.map((catalog) => {
      if (catalog.catalogId !== selectedCatalog.catalogId) {
        return catalog;
      }

      if (editingCatalogItemId) {
        return {
          ...catalog,
          items: catalog.items.map((item) => item.itemId === editingCatalogItemId ? payload : item),
        };
      }

      return {
        ...catalog,
        items: [...catalog.items, payload],
      };
    }));
    setActiveModal(null);
    setSaveStatus('idle');
  };

  if (!isAdmin || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader currentUser={currentUser} currentAreaLabel="Configuración técnica general" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation modules={modules} activeItemId="dashboard" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />
          <main>
            <AccessDeniedState title="No tiene acceso a esta sección" description="La configuración técnica general está disponible principalmente para el Administrador del Sistema. Vuelva al panel principal o revise su perfil para continuar de forma segura." contextLabel="Configuración central del sistema" primaryActionLabel="Volver al panel principal" onPrimaryAction={onGoHome} secondaryActionLabel="Abrir mi perfil" onSecondaryAction={onOpenProfile} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader currentUser={currentUser} currentAreaLabel="Configuración técnica general" onGoHome={handleGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation modules={modules} activeItemId="technical-settings" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={handleGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />
        <main className="min-w-0 space-y-6 pb-28">
          <TechnicalSettingsHeader currentTabLabel={activeTabLabel} pendingChanges={totalPendingChanges} saveStatus={saveStatus} onGoHome={handleGoHome} />

          {loadStatus === 'loading' ? <TechnicalSettingsLoadingState /> : null}
          {loadStatus === 'error' ? <TechnicalSettingsErrorState onRetry={() => setRetryCount((value) => value + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              <SettingsSummaryCards items={summaryCards} lastUpdatedLabel={formatTimestamp(latestUpdatedAt)} />
              {saveStatus === 'saved' ? <SettingsSuccessState onContinueEditing={() => setSaveStatus('idle')} onGoHome={onGoHome} /> : null}
              {saveStatus === 'validation-error' && validationSummary.length ? <FormValidationSummary title="Corrija los campos resaltados para continuar" items={validationSummary} /> : null}
              <SettingsConflictBanner conflicts={conflicts} onOpenDetail={setActiveDrawerItem} />

              <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                <SectionHeader title="Secciones de configuración" description="Cambie entre parámetros, catálogos y ajustes sin perder el contexto ni los cambios realizados en esta vista." />
                <TechnicalSettingsTabs tabs={technicalSettingsTabs} activeTab={activeTab} onChange={setActiveTab} />
              </section>

              {activeTab === 'parameters' ? <SystemParametersPanel groupedSettings={groupedSettings} errors={settingsErrors} onChangeSetting={handleSettingChange} onOpenDetail={setActiveDrawerItem} /> : null}

              {activeTab === 'catalogs' ? (
                draftCatalogs.length ? (
                  <AuxiliaryCatalogsPanel
                    catalogs={draftCatalogs}
                    selectedCatalogId={selectedCatalogId}
                    searchTerm={catalogSearch}
                    onSelectCatalog={setSelectedCatalogId}
                    onSearch={setCatalogSearch}
                    visibleItems={visibleCatalogItems}
                    onCreateItem={() => openCatalogModal('catalog-create')}
                    onEditItem={(item) => openCatalogModal('catalog-edit', item)}
                    onOpenDetail={setActiveDrawerItem}
                  />
                ) : (
                  <EmptySettingsState title="No hay catálogos auxiliares configurados" description="Agregue catálogos base para habilitar referencias auxiliares y continuar con la administración técnica." />
                )
              ) : null}

              {activeTab === 'adjustments' ? <AdminAdjustmentsPanel adjustments={draftAdjustments} errors={adjustmentErrors} onChangeAdjustment={handleAdjustmentChange} onOpenDetail={setActiveDrawerItem} /> : null}

              <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                <SectionHeader title="Resumen operativo de catálogos" description="Revise rápidamente cuántos registros auxiliares permanecen activos dentro de la configuración actual." />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <article className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
                    <p className="text-sm text-gray-500">Elementos auxiliares</p>
                    <p className="mt-2 text-2xl font-semibold text-[#2F3A45]">{catalogSummary.totalItems}</p>
                  </article>
                  <article className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
                    <p className="text-sm text-gray-500">Elementos activos</p>
                    <p className="mt-2 text-2xl font-semibold text-[#2F3A45]">{catalogSummary.activeItems}</p>
                  </article>
                  <article className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
                    <p className="text-sm text-gray-500">Payload preparado</p>
                    <p className="mt-2 text-sm text-[#2F3A45] break-all">{JSON.stringify(buildSavePayload({ settings: draftSettings, adjustments: draftAdjustments, catalogs: draftCatalogs })).slice(0, 110)}...</p>
                  </article>
                </div>
              </section>

              <SaveSettingsBar pendingChanges={totalPendingChanges} activeSectionLabel={activeTabLabel} isSaving={saveStatus === 'saving'} canSave={loadStatus === 'ready' && !conflicts.length} onResetSection={() => setActiveModal('reset-section')} onGoHome={handleGoHome} onSave={handleSave} />
            </>
          ) : null}
        </main>
      </div>

      {activeModal === 'catalog-create' || activeModal === 'catalog-edit' ? (
        <AuxCatalogFormModal
          catalog={selectedCatalog}
          values={catalogFormValues}
          errors={catalogFormErrors}
          mode={activeModal === 'catalog-edit' ? 'edit' : 'create'}
          onChange={(field, value) => setCatalogFormValues((currentValues) => ({ ...currentValues, [field]: value }))}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveCatalogItem}
        />
      ) : null}

      {activeModal === 'reset-section' ? <ResetSectionModal sectionLabel={activeTabLabel} onClose={() => setActiveModal(null)} onConfirm={handleResetSection} /> : null}

      {activeModal === 'unsaved-exit' ? (
        <UnsavedSettingsModal
          onClose={() => setActiveModal(null)}
          onStay={() => setActiveModal(null)}
          onDiscard={() => {
            setActiveModal(null);
            setDraftSettings(cloneSettingsCollection(savedSettings));
            setDraftAdjustments(cloneSettingsCollection(savedAdjustments));
            setDraftCatalogs(cloneAuxCatalogs(savedCatalogs));
            onGoHome();
          }}
          onSave={() => {
            setActiveModal(null);
            handleSave();
          }}
        />
      ) : null}

      {activeDrawerItem ? <TechnicalSettingDetailDrawer item={activeDrawerItem} onClose={() => setActiveDrawerItem(null)} /> : null}
    </div>
  );
}