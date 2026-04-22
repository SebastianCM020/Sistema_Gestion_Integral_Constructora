import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';

export default function RecoveryPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Por favor, ingrese un formato de correo válido.');
      setStatus('error');
      return;
    }

    setErrorMessage('');
    setStatus('loading');

    try {
      const resp = await api.post('/auth/recover-password', { email });
      if (resp.status === 200) {
        setStatus('success');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setErrorMessage('Este correo no está registrado en el sistema.');
      } else {
        setErrorMessage(error.response?.data?.error || 'Error conectando al servidor.');
      }
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-icaro-950 p-4">
      <div className="w-full max-w-md card">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-icaro-900 border border-icaro-700 mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">ICARO</h1>
        </div>

        {status === 'success' ? (
          <div className="text-center py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Instrucciones enviadas</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Si el correo <strong>{email}</strong> está registrado, recibirá instrucciones seguras para restaurar su acceso al sistema web o móvil.
            </p>
            <Link to="/login" className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-icaro-800 hover:bg-icaro-700 text-white rounded-lg transition-colors font-semibold">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold text-white mb-1">Recuperar Acceso</h2>
              <p className="text-gray-400 text-sm">Ingrese su correo corporativo y le enviaremos instrucciones.</p>
            </div>

            {status === 'error' && errorMessage && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-icaro-500 focus:border-transparent transition-all placeholder:text-gray-600"
                  placeholder="usuario@icaro.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full flex justify-center py-2.5 px-4 rounded-lg font-semibold shadow-sm text-white ${
                  status === 'loading' ? 'bg-icaro-700/50 cursor-not-allowed' : 'btn-primary'
                }`}
              >
                {status === 'loading' ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Enviar instrucciones'
                )}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white hover:underline transition-colors">
                  Cancelar y volver
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
