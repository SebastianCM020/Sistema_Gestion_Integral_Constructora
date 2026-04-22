import React, { useState } from 'react';
import { Building2, CheckCircle2 } from 'lucide-react';
import { FormFieldErrorMessage } from '../components/system/FormFieldErrorMessage.jsx';
import { FormValidationSummary } from '../components/system/FormValidationSummary.jsx';
import { buildFormValidationSummary } from '../utils/validationHelpers.js';

function Logo({ className = 'text-xl' }) {
  return (
    <div className={`flex items-center gap-2 font-semibold ${className}`}>
      <div className="w-8 h-8 rounded bg-[#1F4E79] text-white flex items-center justify-center font-bold">
        <Building2 size={20} />
      </div>
      <span className="tracking-tight text-[#1F4E79]">
        ICARO <span className="font-light text-[#2F3A45]">Gestión</span>
      </span>
    </div>
  );
}

export function RecoveryView({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const validationSummary = buildFormValidationSummary(errorMessage ? { email: errorMessage } : {});

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Por favor, ingrese un formato de correo válido.');
      return;
    }

    setErrorMessage('');
    setStatus('loading');

    window.setTimeout(() => {
      setStatus('success');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] font-sans text-[#111827] p-4">
      <div className="w-full max-w-[440px]">
        <div className="flex justify-center mb-8">
          <Logo className="text-2xl" />
        </div>
        <div className="bg-white p-8 rounded-[12px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#D1D5DB]">
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#16A34A]/10 text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-semibold text-[#2F3A45] mb-2">Instrucciones enviadas</h2>
              <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                Si el correo <strong>{email}</strong> está registrado, recibirá instrucciones seguras para restaurar su acceso al panel principal.
              </p>
              <button
                onClick={onBackToLogin}
                className="w-full h-[44px] border-2 border-[#1F4E79] text-[#1F4E79] hover:bg-[#F7F9FC] rounded-[12px] font-medium text-sm transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#2F3A45] mb-2">Recuperar acceso</h2>
                <p className="text-gray-500 text-sm">Ingrese su correo corporativo y le enviaremos instrucciones para volver a operar en el sistema.</p>
              </div>
              {validationSummary.length ? <FormValidationSummary title="Revise el dato ingresado" items={validationSummary} /> : null}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#2F3A45] mb-1.5">Correo electrónico corporativo</label>
                  <input
                    type="text"
                    className={`w-full px-3 h-[44px] rounded-[12px] border ${errorMessage ? 'border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'} focus:outline-none focus:ring-1 transition-colors text-sm`}
                    placeholder="usuario@icaro.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={status === 'loading'}
                  />
                  <FormFieldErrorMessage fieldId="recovery-email" message={errorMessage} />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full h-[44px] bg-[#1F4E79] hover:bg-[#153a5c] text-white rounded-[12px] font-medium text-sm transition-colors flex items-center justify-center disabled:opacity-70"
                >
                  {status === 'loading' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Enviar instrucciones'}
                </button>
                <div className="text-center pt-2">
                  <button type="button" onClick={onBackToLogin} className="text-sm font-medium text-[#1F4E79] hover:underline">
                    Cancelar y volver
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}