import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que la siguiente renderización muestre la IU alternativa.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("ErrorBoundary atrapó un error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier IU alternativa
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-red-50 rounded-[12px] border border-red-200">
          <div className="max-w-md text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Error de Renderizado UI</h2>
            <p className="text-sm text-red-600 mb-6">
              El sistema ha prevenido una caída crítica protegiendo tu sesión. Un componente visual ha fallado al cargar.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-white p-3 rounded text-left text-xs text-red-800 overflow-auto max-h-[150px] mb-6 border border-red-200">
                <p className="font-bold">{this.state.error.toString()}</p>
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-[10px] bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            >
              <RefreshCcw size={18} />
              Recargar módulo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
