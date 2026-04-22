import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  KeyRound,
  Laptop,
  LogOut,
  Shield,
  X,
} from 'lucide-react';
import { AppHeader } from '../components/ui/AppHeader.jsx';

export function ProfileView({ currentUser, onBackToDashboard, onLogout }) {
  const [activeModal, setActiveModal] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState('idle');

  const handlePasswordChange = (event) => {
    event.preventDefault();
    setPasswordStatus('loading');

    window.setTimeout(() => {
      setPasswordStatus('success');
      window.setTimeout(() => {
        setActiveModal(null);
        setPasswordStatus('idle');
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#111827]">
      <AppHeader
        currentUser={currentUser}
        currentAreaLabel="Mi perfil operativo"
        onGoHome={onBackToDashboard}
        onOpenProfile={() => {}}
        onLogout={onLogout}
        onOpenNavigation={() => {}}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button type="button" onClick={onBackToDashboard} className="hover:text-[#1F4E79]">Panel principal</button>
          <ChevronRight size={14} />
          <span className="font-medium text-[#1F4E79]">Mi perfil operativo</span>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm overflow-hidden">
              <div className="border-b border-[#D1D5DB] bg-gray-50/70 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-[#2F3A45]">Perfil y gestión de sesión</h1>
                  <p className="text-sm text-gray-500 mt-1">Consulte su información operativa, seguridad y actividad reciente.</p>
                </div>
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#1F4E79] px-4 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40"
                >
                  Volver al panel principal
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Nombre completo</p>
                  <p className="text-base font-medium text-[#2F3A45]">{currentUser.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Correo corporativo</p>
                  <p className="text-base text-[#2F3A45]">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Rol en sistema</p>
                  <p className="text-base text-[#2F3A45]">{currentUser.roleName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Estado de cuenta</p>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-[#16A34A]/20 bg-[#16A34A]/10 px-2.5 py-1 text-sm font-medium text-[#16A34A]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                    {currentUser.status}
                  </span>
                </div>
                <div className="md:col-span-2 border-t border-dashed border-[#D1D5DB] pt-5">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Proyecto o frente asociado</p>
                  <div className="flex items-center gap-2 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-[#2F3A45] font-medium">
                    <Building2 size={18} className="text-[#1F4E79]" />
                    {currentUser.projectLabel}
                  </div>
                </div>
              </div>
            </section>

            <div className="rounded-[12px] border border-[#DCEAF7] bg-[#DCEAF7]/50 p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-[#1F4E79] shrink-0 mt-0.5" />
              <p className="text-sm text-[#2F3A45]">
                <strong>Gestión de accesos:</strong> si requiere actualizar su rol, permisos o proyecto asignado, contacte al administrador del sistema para evitar inconsistencias operativas.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm overflow-hidden">
              <div className="border-b border-[#D1D5DB] bg-gray-50/70 px-6 py-4">
                <h2 className="text-lg font-semibold text-[#2F3A45] flex items-center gap-2">
                  <Shield size={20} className="text-[#1F4E79]" />
                  Seguridad y sesión
                </h2>
              </div>

              <div className="p-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal('password')}
                  className="w-full h-[44px] flex items-center justify-center gap-2 border-2 border-[#1F4E79] text-[#1F4E79] hover:bg-[#F7F9FC] rounded-[12px] font-medium text-sm transition-colors"
                >
                  <KeyRound size={18} />
                  Cambiar contraseña
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('logoutOthers')}
                  className="w-full h-[44px] flex items-center justify-center gap-2 text-[#2F3A45] bg-[#F7F9FC] border border-[#D1D5DB] hover:bg-gray-100 rounded-[12px] font-medium text-sm transition-colors"
                >
                  <Laptop size={18} />
                  Cerrar otras sesiones
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('logout')}
                  className="w-full h-[44px] flex items-center justify-center gap-2 bg-[#F7F9FC] text-[#DC2626] border border-[#DC2626]/20 hover:bg-[#DC2626]/10 rounded-[12px] font-medium text-sm transition-colors"
                >
                  <LogOut size={18} />
                  Cerrar sesión actual
                </button>
              </div>
            </section>

            <section className="rounded-[12px] border border-[#D1D5DB] bg-white shadow-sm overflow-hidden">
              <div className="border-b border-[#D1D5DB] bg-gray-50/70 px-6 py-4">
                <h2 className="text-base font-semibold text-[#2F3A45] flex items-center gap-2">
                  <Clock size={18} className="text-gray-500" />
                  Actividad de sesión
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4">
                  <p className="text-sm font-medium text-[#2F3A45]">Sesión actual</p>
                  <p className="text-xs text-gray-500 mt-1">Último acceso: {currentUser.lastAccess}</p>
                </div>
                <div className="rounded-[12px] border border-[#D1D5DB] bg-white p-4">
                  <p className="text-sm font-medium text-[#2F3A45]">Contexto operativo</p>
                  <p className="text-xs text-gray-500 mt-1">Su panel principal se ajusta automáticamente al rol activo y los módulos autorizados.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {activeModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 p-4 backdrop-blur-sm">
          {activeModal === 'password' ? (
            <div className="w-full max-w-md overflow-hidden rounded-[12px] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#D1D5DB] bg-gray-50/70 px-6 py-4">
                <h3 className="text-lg font-semibold text-[#2F3A45]">Cambiar contraseña</h3>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                {passwordStatus === 'success' ? (
                  <div className="py-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#16A34A]/10 text-[#16A34A]">
                      <CheckCircle2 size={32} />
                    </div>
                    <p className="font-medium text-[#2F3A45] mb-1">Contraseña actualizada</p>
                    <p className="text-sm text-gray-500">Su contraseña fue modificada correctamente.</p>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2F3A45] mb-1.5">Contraseña actual</label>
                      <input type="password" required className="w-full px-3 h-[44px] rounded-[12px] border border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79] focus:outline-none focus:ring-1 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2F3A45] mb-1.5">Nueva contraseña</label>
                      <input type="password" required className="w-full px-3 h-[44px] rounded-[12px] border border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79] focus:outline-none focus:ring-1 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2F3A45] mb-1.5">Confirmar nueva contraseña</label>
                      <input type="password" required className="w-full px-3 h-[44px] rounded-[12px] border border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79] focus:outline-none focus:ring-1 text-sm" />
                    </div>
                    <div className="rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-3 text-xs text-gray-500">
                      Use al menos 8 caracteres, un número y un símbolo para mantener la seguridad operativa.
                    </div>
                    <div className="mt-2 flex gap-3 border-t border-[#D1D5DB] pt-4">
                      <button type="button" onClick={() => setActiveModal(null)} className="flex-1 h-[44px] rounded-[12px] border border-[#D1D5DB] text-sm font-medium text-[#2F3A45] hover:bg-gray-50">Cancelar</button>
                      <button type="submit" disabled={passwordStatus === 'loading'} className="flex-1 h-[44px] rounded-[12px] bg-[#1F4E79] text-sm font-medium text-white hover:bg-[#153a5c] flex items-center justify-center">
                        {passwordStatus === 'loading' ? <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Guardar cambios'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : null}

          {activeModal === 'logout' ? (
            <div className="w-full max-w-sm overflow-hidden rounded-[12px] bg-white shadow-xl">
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
                  <LogOut size={28} />
                </div>
                <h3 className="text-lg font-semibold text-[#2F3A45] mb-2">¿Cerrar sesión?</h3>
                <p className="text-sm text-gray-600 mb-6">Deberá volver a ingresar sus credenciales para acceder nuevamente al panel principal.</p>
                <div className="flex gap-3">
                  <button onClick={() => setActiveModal(null)} className="flex-1 h-[44px] rounded-[12px] border border-[#D1D5DB] text-sm font-medium text-[#2F3A45] hover:bg-gray-50">Cancelar</button>
                  <button onClick={() => onLogout({ expired: false })} className="flex-1 h-[44px] rounded-[12px] bg-[#DC2626] text-sm font-medium text-white hover:bg-[#b91c1c]">Cerrar sesión</button>
                </div>
              </div>
            </div>
          ) : null}

          {activeModal === 'logoutOthers' ? (
            <div className="w-full max-w-sm overflow-hidden rounded-[12px] bg-white shadow-xl">
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3 text-[#F59E0B]">
                  <AlertTriangle size={28} />
                  <h3 className="text-lg font-semibold text-[#2F3A45]">Cerrar otras sesiones</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">Esta acción cerrará su sesión en otros dispositivos. Su sesión actual permanecerá activa para que continúe trabajando sin perder contexto.</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setActiveModal(null)} className="px-4 h-[44px] rounded-[12px] border border-[#D1D5DB] text-sm font-medium text-[#2F3A45] hover:bg-gray-50">Cancelar</button>
                  <button onClick={() => setActiveModal(null)} className="px-4 h-[44px] rounded-[12px] bg-[#2F3A45] text-sm font-medium text-white hover:bg-[#1f262d]">Confirmar acción</button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}