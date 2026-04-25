import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/axios';

export function ForcePasswordChangeModal({ user, onComplete }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }
    if (newPassword === 'Icaro2025!') {
      return setError('Debes elegir una contraseña distinta a la temporal.');
    }

    setStatus('loading');
    setError(null);

    try {
      await api.patch('/auth/change-password', { newPassword });
      setStatus('success');
      setTimeout(() => onComplete(user), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña.');
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[16px] bg-white shadow-2xl">
        <div className="bg-[#1F4E79] p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
            <Lock size={32} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">Cambio de Contraseña Obligatorio</h2>
          <p className="mt-2 text-sm text-[#DCEAF7]">
            Hola {user.nombre}, por políticas de seguridad debes cambiar tu contraseña temporal antes de acceder al sistema.
          </p>
        </div>

        <div className="p-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 size={48} className="text-[#16A34A]" />
              <h3 className="mt-4 text-lg font-medium text-[#2F3A45]">¡Contraseña actualizada!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Redirigiendo al sistema...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-[#DC2626]/20 bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]">
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-[#2F3A45]">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 px-3 pr-10 text-sm text-[#111827] focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-[#2F3A45]">Confirmar contraseña</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-[#111827] focus:border-[#1F4E79] focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
                  placeholder="Vuelve a escribir tu contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-[#1F4E79] text-sm font-medium text-white transition-colors hover:bg-[#153a5c] disabled:opacity-70"
              >
                {status === 'loading' ? 'Guardando...' : 'Cambiar contraseña y continuar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
