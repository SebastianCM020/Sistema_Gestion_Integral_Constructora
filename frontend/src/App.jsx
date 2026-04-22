import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './store/AuthContext';
import { useContext } from 'react';
import LoginPage from './pages/auth/LoginPage';
import RecoveryPage from './pages/auth/RecoveryPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ModuleRouterPage from './pages/dashboard/ModuleRouterPage';
import AdminRouterPage from './pages/dashboard/AdminRouterPage';

// Componente para proteger las rutas privadas
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-icaro-950 flex items-center justify-center text-white">Cargando Sistema...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Placeholder = ({ title }) => {
  const location = useLocation();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card text-center max-w-md">
        <h1 className="text-2xl font-bold text-icaro-500 mb-2">ICARO Sistema</h1>
        <p className="text-gray-400">{title}</p>
        <p className="text-xs text-red-500 mt-2 font-mono">Ruta no encontrada: {location.pathname}</p>
        <p className="text-xs text-gray-600 mt-4">v1.0.0 — En desarrollo</p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/recover-password" element={<RecoveryPage />} />
          
          {/* Rutas Privadas envueltas en PrivateRoute */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/module/:moduleId" element={<PrivateRoute><ModuleRouterPage /></PrivateRoute>} />
          <Route path="/admin/:section" element={<PrivateRoute><AdminRouterPage /></PrivateRoute>} />
          
          <Route path="*"          element={<Placeholder title="404 — Página no encontrada" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

