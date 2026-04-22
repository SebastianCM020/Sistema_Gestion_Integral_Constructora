import axios from 'axios';

// La URL base es simplemente `/api/v1` porque en `vite.config.js` 
// configuramos el proxy para que envíe todo al backend (puerto 3001)
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar automáticamente el JWT en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('icaro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor global para captar Tokens expirados (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token caducado o inválido -> forzar logout
      localStorage.removeItem('icaro_token');
      localStorage.removeItem('icaro_user');
      
      // No redirigir de golpe si ya estamos en rutas públicas
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
