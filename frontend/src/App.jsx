import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Páginas (se implementarán sprint a sprint)
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="card text-center max-w-md">
      <h1 className="text-2xl font-bold text-icaro-500 mb-2">ICARO Sistema</h1>
      <p className="text-gray-400">{title}</p>
      <p className="text-xs text-gray-600 mt-4">v1.0.0 — En desarrollo</p>
    </div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"     element={<Placeholder title="Módulo de Login" />} />
        <Route path="/dashboard" element={<Placeholder title="Dashboard Principal" />} />
        <Route path="/obra"      element={<Placeholder title="Módulo Técnico — Obra" />} />
        <Route path="/compras"   element={<Placeholder title="Módulo de Compras" />} />
        <Route path="/reportes"  element={<Placeholder title="Módulo de Reportes" />} />
        <Route path="*"          element={<Placeholder title="404 — Página no encontrada" />} />
      </Routes>
    </BrowserRouter>
  )
}
