import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al cargar la app, comprobar si hay token guardado
    const token = localStorage.getItem('icaro_token');
    const storedUser = localStorage.getItem('icaro_user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Opcional: Podríamos re-certificar silenciosamente con `/api/v1/auth/me` aquí
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Guardar token y user
      localStorage.setItem('icaro_token', data.token);
      localStorage.setItem('icaro_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Error de conexión al servidor' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('icaro_token');
    localStorage.removeItem('icaro_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
