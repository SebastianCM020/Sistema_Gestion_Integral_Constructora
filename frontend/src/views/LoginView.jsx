import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
} from 'lucide-react';
import { demoAccounts } from '../data/icaroData.js';
import { FormFieldErrorMessage } from '../components/system/FormFieldErrorMessage.jsx';
import { FormValidationSummary } from '../components/system/FormValidationSummary.jsx';
import { SystemAlertBanner } from '../components/system/SystemAlertBanner.jsx';
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

export function LoginView({ onLoginSuccess, onOpenRecovery }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const validationSummary = buildFormValidationSummary(errors);

  useEffect(() => {
    if (window.sessionStorage.getItem('sessionExpired') === 'true') {
      setStatus('expired');
      window.sessionStorage.removeItem('sessionExpired');
    }
  }, []);

  const validate = () => {
    const nextErrors = {};

    if (!email) {
      nextErrors.email = 'El correo electrónico es requerido.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Formato de correo inválido.';
    }

    if (!password) {
      nextErrors.password = 'La contraseña es requerida.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setStatus('loading');

    window.setTimeout(() => {
      if (email.toLowerCase() === 'error@icaro.com') {
        setStatus('error');
        return;
      }

      if (email.toLowerCase() === 'expirado@icaro.com') {
        setStatus('expired');
        return;
      }

      onLoginSuccess(email);
    }, 1100);
  };

  return (
    <div className="min-h-screen flex bg-[#F7F9FC] font-sans text-[#111827]">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1F4E79] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white text-2xl font-semibold mb-12">
            <div className="w-10 h-10 rounded bg-white text-[#1F4E79] flex items-center justify-center font-bold">
              <Building2 size={24} />
            </div>
            <span className="tracking-tight">
              ICARO <span className="font-light opacity-80">Gestión Integral</span>
            </span>
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl text-white font-semibold mb-4 leading-tight">Sistema central de operaciones</h1>
          <p className="text-[#DCEAF7] text-lg opacity-90 leading-relaxed">
            Ingrese para acceder al panel principal por rol, sus pendientes operativos y los módulos autorizados para su sesión.
          </p>
        </div>
        <div className="relative z-10 text-[#DCEAF7] opacity-60 text-sm">© 2026 ICARO Constructora. Todos los derechos reservados.</div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo className="text-2xl" />
          </div>

          <div className="bg-white p-8 rounded-[12px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#D1D5DB]">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[#2F3A45] mb-2">Iniciar sesión</h2>
              <p className="text-gray-500 text-sm">Acceso seguro al sistema empresarial</p>
            </div>

            {status === 'error' ? <SystemAlertBanner tone="error" icon={AlertCircle} title="No fue posible iniciar sesion" description="Verifique su correo y contraseña o contacte al administrador para continuar." /> : null}

            {status === 'expired' ? <SystemAlertBanner tone="warning" icon={Clock} title="La sesion ha expirado" description="Ingrese nuevamente para volver al panel principal de forma segura." /> : null}

            {validationSummary.length ? <FormValidationSummary title="Corrija los campos resaltados para continuar" items={validationSummary} /> : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2F3A45] mb-1.5">Correo electrónico corporativo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="text"
                    className={`w-full pl-10 pr-3 h-[44px] rounded-[12px] border ${errors.email ? 'border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'} focus:outline-none focus:ring-1 transition-colors text-sm`}
                    placeholder="usuario@icaro.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={status === 'loading'}
                  />
                </div>
                <FormFieldErrorMessage fieldId="login-email" message={errors.email} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2F3A45] mb-1.5">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full pl-10 pr-10 h-[44px] rounded-[12px] border ${errors.password ? 'border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-[#1F4E79]'} focus:outline-none focus:ring-1 transition-colors text-sm`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={status === 'loading'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#1F4E79]"
                    onClick={() => setShowPassword((previous) => !previous)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormFieldErrorMessage fieldId="login-password" message={errors.password} />
              </div>

              <div className="flex items-center justify-between pt-1 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#D1D5DB] text-[#1F4E79] focus:ring-[#1F4E79]" />
                  <span className="text-sm text-gray-600">Recordar sesión</span>
                </label>
                <button type="button" onClick={onOpenRecovery} className="text-sm font-medium text-[#1F4E79] hover:underline">
                  ¿Olvidó su contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full h-[44px] bg-[#1F4E79] hover:bg-[#153a5c] text-white rounded-[12px] font-medium text-sm transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {status === 'loading' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Entrar al panel principal'}
              </button>
            </form>

            <div className="mt-6 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 mb-2">Cuentas de validación</p>
              <p className="text-sm text-[#2F3A45]">Use cualquiera de estos correos para probar el panel por rol:</p>
              <p className="mt-2 text-xs text-gray-500 leading-6">{demoAccounts.join(' • ')}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#D1D5DB] text-center">
              <p className="text-xs text-gray-500">
                <Shield size={14} className="inline mr-1 mb-0.5" />
                Acceso exclusivo para usuarios autorizados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}