import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { AppHeader } from '../../components/ui/AppHeader.jsx';
import { SidebarNavigation } from '../../components/ui/SidebarNavigation.jsx';
import { SectionHeader } from '../../components/ui/SectionHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SystemAlertBanner } from '../../components/system/SystemAlertBanner.jsx';
import { SystemValidationBanner } from '../../components/system/SystemValidationBanner.jsx';
import { FormFieldErrorMessage } from '../../components/system/FormFieldErrorMessage.jsx';
import { FormValidationSummary } from '../../components/system/FormValidationSummary.jsx';
import { AccessDeniedState } from '../../components/system/AccessDeniedState.jsx';
import { SessionExpiredState } from '../../components/system/SessionExpiredState.jsx';
import { NotFoundState } from '../../components/system/NotFoundState.jsx';
import { BusinessRuleBlockedState } from '../../components/system/BusinessRuleBlockedState.jsx';
import { InlineFieldValidator } from '../../components/system/InlineFieldValidator.jsx';
import { SystemErrorPanel } from '../../components/system/SystemErrorPanel.jsx';
import { RetryActionCard } from '../../components/system/RetryActionCard.jsx';
import { PermissionContextCard } from '../../components/system/PermissionContextCard.jsx';
import { ValidationRulesInfoCard } from '../../components/system/ValidationRulesInfoCard.jsx';
import { ForbiddenActionModal } from '../../components/system/ForbiddenActionModal.jsx';
import { UnsavedChangesModal } from '../../components/system/UnsavedChangesModal.jsx';
import { ControlledSystemErrorModal } from '../../components/system/ControlledSystemErrorModal.jsx';
import { ValidationExamplesPanel } from '../../components/system/ValidationExamplesPanel.jsx';
import { SystemValidationLoadingState } from '../../components/system/SystemValidationLoadingState.jsx';
import { getModulesForUser } from '../../data/icaroData.js';
import { getSystemErrorByCode } from '../../data/mockSystemErrors.js';
import { validationFormDefaults, validationModuleOptions, validationRuleCatalog } from '../../data/mockValidationRules.js';
import { canAccessValidationReference, buildPermissionContextCards, getPreviewStateByCode, getValidationExampleOptions } from '../../utils/accessControlHelpers.js';
import { buildFormValidationSummary, focusFirstInvalidField, getInlineValidatorState, isFormDirty, validateAccessRequestForm } from '../../utils/validationHelpers.js';

function ValidationAccessHeader({ onGoHome }) {
  return (
    <section className="rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <button type="button" onClick={onGoHome} className="hover:text-[#1F4E79]">Panel principal</button>
        <span>/</span>
        <span className="font-medium text-[#1F4E79]">Validaciones y control de acceso</span>
      </div>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DCEAF7] text-[#1F4E79]"><ShieldAlert size={22} /></div>
          <h1 className="mt-4 text-2xl font-semibold text-[#2F3A45]">Validaciones y control de acceso</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">Centralice estados de validacion, permisos, sesion, recurso no disponible y errores controlados con una salida segura y reusable para todo ICARO.</p>
          <p className="mt-3 text-sm text-[#1F4E79]">Esta vista de referencia demuestra la capa transversal conectada a login, recuperacion y modulos restringidos.</p>
        </div>
        <button type="button" onClick={onGoHome} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Volver al panel</button>
      </div>
    </section>
  );
}

function FormInputBlock({ id, label, children, errorMessage, validator }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#2F3A45]">{label}</label>
      <div className="mt-2">{children}</div>
      <FormFieldErrorMessage fieldId={id} message={errorMessage} />
      <InlineFieldValidator tone={validator.tone} label={validator.label} />
    </div>
  );
}

export function ValidationAccessControlView({ currentUser, isRestricted = false, onGoHome, onOpenProfile, onLogout, onOpenModule }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [formValues, setFormValues] = useState(validationFormDefaults);
  const [formErrors, setFormErrors] = useState({});
  const [statusBanner, setStatusBanner] = useState(null);
  const [activePreviewCode, setActivePreviewCode] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const modules = getModulesForUser(currentUser);
  const isAuthorizedRole = canAccessValidationReference(currentUser);
  const summaryItems = useMemo(() => buildFormValidationSummary(formErrors), [formErrors]);
  const permissionCards = useMemo(() => buildPermissionContextCards(currentUser), [currentUser]);
  const previewState = useMemo(() => (activePreviewCode ? getPreviewStateByCode(activePreviewCode) : null), [activePreviewCode]);
  const exampleOptions = useMemo(() => getValidationExampleOptions(), []);
  const isDirty = isFormDirty(formValues, validationFormDefaults);

  useEffect(() => {
    setLoadStatus('loading');

    const timer = window.setTimeout(() => {
      setLoadStatus(currentUser.adminUsersShouldFail ? 'error' : 'ready');
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentUser.adminUsersShouldFail, retryCount]);

  const updateField = (field, value) => {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
    setFormErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const handleValidateForm = (event) => {
    event.preventDefault();
    const nextErrors = validateAccessRequestForm(formValues);

    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      setStatusBanner({ tone: 'error', code: 'validation' });
      focusFirstInvalidField(nextErrors);
      return;
    }

    setFormErrors({});
    setStatusBanner({ tone: 'success', code: 'system.success' });
  };

  const renderPreviewState = () => {
    if (!previewState) {
      return (
        <EmptyState
          title="Seleccione un estado para previsualizar"
          description="Use los ejemplos de la parte superior para revisar acceso denegado, sesion expirada, recurso no disponible o bloqueo por reglas del negocio."
          actionLabel="Abrir accion prohibida"
          onAction={() => setActiveModal('forbidden')}
        />
      );
    }

    if (previewState.type === 'forbidden') {
      return (
        <AccessDeniedState
          title={previewState.title}
          description={previewState.message}
          contextLabel={previewState.resourceLabel}
          primaryActionLabel="Volver al panel principal"
          onPrimaryAction={onGoHome}
          secondaryActionLabel="Volver al ejemplo"
          onSecondaryAction={() => setActivePreviewCode(null)}
        />
      );
    }

    if (previewState.type === 'unauthorized') {
      return <SessionExpiredState title={previewState.title} description={previewState.message} onRestartSession={() => onLogout({ expired: true })} onGoHome={onGoHome} />;
    }

    if (previewState.type === 'not-found') {
      return <NotFoundState title={previewState.title} description={previewState.message} primaryActionLabel="Volver al panel principal" onPrimaryAction={onGoHome} secondaryActionLabel="Volver al ejemplo" onSecondaryAction={() => setActivePreviewCode(null)} />;
    }

    if (previewState.type === 'business-rule') {
      return <BusinessRuleBlockedState title={previewState.title} description={previewState.message} contextLabel={previewState.resourceLabel} onResolve={() => setActivePreviewCode(null)} onGoBack={() => setActivePreviewCode(null)} />;
    }

    return null;
  };

  if (!isAuthorizedRole || isRestricted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
        <AppHeader currentUser={currentUser} currentAreaLabel="Validaciones y control de acceso" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
          <SidebarNavigation modules={modules} activeItemId="dashboard" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />
          <main>
            <AccessDeniedState title="Acceso denegado" description="La vista de referencia de validaciones y control de acceso esta reservada para administradores del sistema. Vuelva al panel principal o revise su perfil para continuar." contextLabel="Capa transversal del sistema" primaryActionLabel="Volver al panel principal" onPrimaryAction={onGoHome} secondaryActionLabel="Abrir mi perfil" onSecondaryAction={onOpenProfile} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader currentUser={currentUser} currentAreaLabel="Validaciones y control de acceso" onGoHome={onGoHome} onOpenProfile={onOpenProfile} onLogout={onLogout} onOpenNavigation={() => setMobileNavOpen(true)} />
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] md:px-6">
        <SidebarNavigation modules={modules} activeItemId="system-validations" isOpen={mobileNavOpen} currentUser={currentUser} onClose={() => setMobileNavOpen(false)} onGoHome={onGoHome} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} onLogout={onLogout} />
        <main className="min-w-0 space-y-6">
          <ValidationAccessHeader onGoHome={onGoHome} />

          {loadStatus === 'loading' ? <SystemValidationLoadingState /> : null}
          {loadStatus === 'error' ? <SystemErrorPanel title="No fue posible cargar la capa de validaciones" description="Reintente para revisar estados de error, validacion y acceso sin abandonar el panel principal." onRetry={() => setRetryCount((currentValue) => currentValue + 1)} onGoHome={onGoHome} /> : null}

          {loadStatus === 'ready' ? (
            <>
              {statusBanner?.code === 'validation' ? <SystemValidationBanner title="Corrija los campos resaltados para continuar" description="El formulario no cumple todas las reglas visibles del sistema." items={summaryItems} /> : null}
              {statusBanner?.code === 'system.success' ? <SystemAlertBanner tone="success" title="Validacion completada" description="Los campos cumplen las reglas visibles y la operacion puede continuar de forma segura." /> : null}
              {!statusBanner ? <SystemAlertBanner tone="info" title="Capa transversal lista para reutilizar" description="Esta referencia centraliza mensajes de error, acceso, sesion, reglas del negocio y validaciones de formulario para el resto del sistema." /> : null}

              <ValidationExamplesPanel
                examples={exampleOptions}
                activeCode={activePreviewCode}
                onSelectExample={setActivePreviewCode}
                onOpenForbiddenModal={() => setActiveModal('forbidden')}
                onOpenUnsavedModal={() => setActiveModal('unsaved')}
                onOpenControlledErrorModal={() => setActiveModal('controlled-error')}
              />

              <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                    <SectionHeader title="Estados de acceso y sistema" description="Revise cada estado principal y confirme que siempre existe una salida segura, una accion clara y una sola vista activa." />
                    {renderPreviewState()}
                  </section>

                  <section className="space-y-4 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                    <SectionHeader title="Formulario de validacion de ejemplo" description="Demuestra errores inline, resumen de validacion, foco al primer error y acciones bloqueadas por reglas del negocio." />
                    <form onSubmit={handleValidateForm} className="space-y-5">
                      {summaryItems.length ? <FormValidationSummary title="Campos por corregir" items={summaryItems} /> : null}

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormInputBlock id="system-field-requesterEmail" label="Correo corporativo" errorMessage={formErrors.requesterEmail} validator={getInlineValidatorState('requesterEmail', formValues.requesterEmail, formErrors)}>
                          <input id="system-field-requesterEmail" type="text" value={formValues.requesterEmail} onChange={(event) => updateField('requesterEmail', event.target.value)} placeholder="usuario@icaro.com" className={`h-[44px] w-full rounded-[12px] border px-3 text-sm outline-none ${formErrors.requesterEmail ? 'border-[#DC2626]' : 'border-[#D1D5DB] bg-[#F7F9FC]'}`} />
                        </FormInputBlock>

                        <FormInputBlock id="system-field-moduleId" label="Modulo de destino" errorMessage={formErrors.moduleId} validator={getInlineValidatorState('moduleId', formValues.moduleId, formErrors)}>
                          <select id="system-field-moduleId" value={formValues.moduleId} onChange={(event) => updateField('moduleId', event.target.value)} className={`h-[44px] w-full rounded-[12px] border px-3 text-sm outline-none ${formErrors.moduleId ? 'border-[#DC2626]' : 'border-[#D1D5DB] bg-[#F7F9FC]'}`}>
                            {validationModuleOptions.map((option) => <option key={option.id || 'empty'} value={option.id}>{option.label}</option>)}
                          </select>
                        </FormInputBlock>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormInputBlock id="system-field-projectCode" label="Proyecto o frente" errorMessage={formErrors.projectCode} validator={getInlineValidatorState('projectCode', formValues.projectCode, formErrors)}>
                          <input id="system-field-projectCode" type="text" value={formValues.projectCode} onChange={(event) => updateField('projectCode', event.target.value.toUpperCase())} placeholder="ALT-01" className={`h-[44px] w-full rounded-[12px] border px-3 text-sm outline-none ${formErrors.projectCode ? 'border-[#DC2626]' : 'border-[#D1D5DB] bg-[#F7F9FC]'}`} />
                        </FormInputBlock>

                        <FormInputBlock id="system-field-validUntil" label="Vigencia" errorMessage={formErrors.validUntil} validator={getInlineValidatorState('validUntil', formValues.validUntil, formErrors)}>
                          <input id="system-field-validUntil" type="date" value={formValues.validUntil} onChange={(event) => updateField('validUntil', event.target.value)} className={`h-[44px] w-full rounded-[12px] border px-3 text-sm outline-none ${formErrors.validUntil ? 'border-[#DC2626]' : 'border-[#D1D5DB] bg-[#F7F9FC]'}`} />
                        </FormInputBlock>
                      </div>

                      <FormInputBlock id="system-field-justification" label="Justificacion" errorMessage={formErrors.justification} validator={getInlineValidatorState('justification', formValues.justification, formErrors)}>
                        <textarea id="system-field-justification" value={formValues.justification} onChange={(event) => updateField('justification', event.target.value)} placeholder="Explique por que necesita habilitar esta accion temporal." className={`min-h-[112px] w-full rounded-[12px] border px-3 py-3 text-sm outline-none ${formErrors.justification ? 'border-[#DC2626]' : 'border-[#D1D5DB] bg-[#F7F9FC]'}`} />
                      </FormInputBlock>

                      <div className="flex flex-wrap gap-3">
                        <button type="submit" className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]">Validar y continuar</button>
                        <button type="button" onClick={() => setActivePreviewCode('business.period_closed')} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Simular bloqueo</button>
                        <button type="button" onClick={() => setActiveModal('forbidden')} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]">Accion prohibida</button>
                        <button type="button" onClick={() => setActiveModal('unsaved')} className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]" disabled={!isDirty}>Salir sin guardar</button>
                      </div>
                    </form>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-6 shadow-sm">
                    <SectionHeader title="Contexto de permisos" description="Estas tarjetas resumen como debera llegar el backend con permisos, vigencias y acciones permitidas." />
                    <div className="space-y-4">
                      {permissionCards.map((context) => <PermissionContextCard key={context.id} context={context} />)}
                    </div>
                  </section>

                  <ValidationRulesInfoCard rules={validationRuleCatalog} />

                  <RetryActionCard title="Error controlado y reintento" description="Use esta accion para comprobar que el sistema siempre ofrece reintento o retorno seguro cuando una operacion falla de forma controlada." actionLabel="Abrir error controlado" onAction={() => setActiveModal('controlled-error')} />
                </div>
              </section>
            </>
          ) : null}
        </main>
      </div>

      {activeModal === 'forbidden' ? (
        <ForbiddenActionModal
          title="No puede realizar esta accion"
          description="Su rol o el contexto actual no permiten continuar. Revise los datos y vuelva a intentarlo."
          reasonLabel="Motivo del bloqueo: el proyecto seleccionado no tiene una ventana de vigencia activa para esta operacion."
          onClose={() => setActiveModal(null)}
          onGoBack={() => setActiveModal(null)}
          onResolve={() => {
            setActiveModal(null);
            setActivePreviewCode('permissions.project_window_denied');
          }}
        />
      ) : null}

      {activeModal === 'unsaved' ? (
        <UnsavedChangesModal
          onClose={() => setActiveModal(null)}
          onStay={() => setActiveModal(null)}
          onDiscard={() => {
            setFormValues(validationFormDefaults);
            setFormErrors({});
            setStatusBanner(null);
            setActiveModal(null);
          }}
        />
      ) : null}

      {activeModal === 'controlled-error' ? (
        <ControlledSystemErrorModal
          title="No fue posible completar la operacion"
          description="El sistema no pudo terminar la accion, pero puede reintentar sin perder el contexto actual."
          onClose={() => setActiveModal(null)}
          onRetry={() => {
            setActiveModal(null);
            setStatusBanner({ tone: 'success', code: 'system.success' });
          }}
          onGoHome={() => {
            setActiveModal(null);
            onGoHome();
          }}
        />
      ) : null}
    </div>
  );
}