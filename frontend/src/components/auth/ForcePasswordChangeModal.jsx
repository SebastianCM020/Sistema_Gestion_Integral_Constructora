import React, { useState, useMemo } from 'react';
import { ShieldAlert, CheckCircle2, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import api from '../../utils/axios';

// ─── Criterios de seguridad de contraseña ────────────────────────────────────
const CRITERIOS = [
  { id: 'longitud',  label: 'Mínimo 8 caracteres',              test: (p) => p.length >= 8 },
  { id: 'mayuscula', label: 'Al menos una mayúscula (A-Z)',      test: (p) => /[A-Z]/.test(p) },
  { id: 'minuscula', label: 'Al menos una minúscula (a-z)',      test: (p) => /[a-z]/.test(p) },
  { id: 'numero',    label: 'Al menos un número (0-9)',          test: (p) => /[0-9]/.test(p) },
  { id: 'especial',  label: 'Al menos un carácter especial (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function getStrengthLevel(cumplidos) {
  if (cumplidos <= 1) return { nivel: 'Muy débil', color: 'bg-red-500',    ancho: 'w-1/5' };
  if (cumplidos === 2) return { nivel: 'Débil',    color: 'bg-orange-400',  ancho: 'w-2/5' };
  if (cumplidos === 3) return { nivel: 'Regular',  color: 'bg-yellow-400',  ancho: 'w-3/5' };
  if (cumplidos === 4) return { nivel: 'Fuerte',   color: 'bg-blue-400',    ancho: 'w-4/5' };
  return                       { nivel: 'Segura',  color: 'bg-green-500',   ancho: 'w-full' };
}

export function ForcePasswordChangeModal({ user, onComplete }) {
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [error,           setError]           = useState(null);
  const [status,          setStatus]          = useState('idle'); // idle | loading | success

  // ── Evaluación de criterios en tiempo real ──────────────────────────────────
  const criteriosEvaluados = useMemo(
    () => CRITERIOS.map((c) => ({ ...c, cumplido: newPassword.length > 0 && c.test(newPassword) })),
    [newPassword]
  );
  const totalCumplidos  = criteriosEvaluados.filter((c) => c.cumplido).length;
  const todosAprobados  = totalCumplidos === CRITERIOS.length;
  const strength        = newPassword.length > 0 ? getStrengthLevel(totalCumplidos) : null;
  const confirmMatch    = confirmPassword.length > 0 && newPassword === confirmPassword;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!todosAprobados) {
      return setError('La contraseña no cumple todos los criterios de seguridad.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }
    if (newPassword === 'Icaro2025!') {
      return setError('Debes elegir una contraseña distinta a la temporal.');
    }

    setStatus('loading');
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

        {/* ── Header azul ── */}
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
              <p className="mt-2 text-sm text-gray-500">Redirigiendo al sistema...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Error general */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-[#DC2626]/20 bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]">
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Campo nueva contraseña */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#2F3A45]">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="pwd-nueva"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 px-3 pr-10 text-sm
                               text-[#111827] focus:border-[#1F4E79] focus:outline-none focus:ring-1
                               focus:ring-[#1F4E79]"
                    placeholder="Nueva contraseña segura"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Barra de fortaleza */}
                {strength && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.ancho}`} />
                    </div>
                    <p className={`mt-1 text-xs font-medium ${
                      totalCumplidos <= 1 ? 'text-red-500'
                      : totalCumplidos === 2 ? 'text-orange-500'
                      : totalCumplidos === 3 ? 'text-yellow-600'
                      : totalCumplidos === 4 ? 'text-blue-500'
                      : 'text-green-600'
                    }`}>
                      Seguridad: {strength.nivel}
                    </p>
                  </div>
                )}

                {/* Lista de criterios */}
                {newPassword.length > 0 && (
                  <ul className="mt-3 space-y-1.5 rounded-lg border border-gray-100 bg-gray-50 p-3">
                    {criteriosEvaluados.map((c) => (
                      <li key={c.id} className="flex items-center gap-2 text-xs">
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full
                          ${c.cumplido ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                          {c.cumplido ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                        </span>
                        <span className={c.cumplido ? 'text-green-700' : 'text-gray-500'}>
                          {c.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Campo confirmar contraseña */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#2F3A45]">
                  Confirmar contraseña
                </label>
                <input
                  id="pwd-confirmar"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`h-11 w-full rounded-lg border px-3 text-sm text-[#111827]
                             focus:outline-none focus:ring-1 transition-colors
                             ${confirmPassword.length === 0
                               ? 'border-gray-300 focus:border-[#1F4E79] focus:ring-[#1F4E79]'
                               : confirmMatch
                               ? 'border-green-400 focus:border-green-500 focus:ring-green-400 bg-green-50'
                               : 'border-red-300 focus:border-red-400 focus:ring-red-300 bg-red-50'
                             }`}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                />
                {confirmPassword.length > 0 && (
                  <p className={`mt-1 text-xs font-medium ${confirmMatch ? 'text-green-600' : 'text-red-500'}`}>
                    {confirmMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                  </p>
                )}
              </div>

              {/* Botón submit */}
              <button
                id="btn-cambiar-password"
                type="submit"
                disabled={status === 'loading' || !todosAprobados || !confirmMatch}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-[#1F4E79]
                           text-sm font-medium text-white transition-colors hover:bg-[#153a5c]
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Guardando...' : 'Cambiar contraseña y continuar'}
              </button>

              {!todosAprobados && newPassword.length > 0 && (
                <p className="text-center text-xs text-gray-400">
                  Cumple los {CRITERIOS.length} criterios para habilitar el botón
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
