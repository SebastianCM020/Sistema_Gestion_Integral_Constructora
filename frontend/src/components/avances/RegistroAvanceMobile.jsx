import React, { useState, useEffect } from 'react';
import { fetchAvancesPorRubro } from '../../services/offlineSyncService';

const RegistroAvanceMobile = ({ rubro, onGuardar }) => {
  const [cantidad, setCantidad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Solo resetea el formulario cuando cambia el RUBRO seleccionado (por id),
  // no cuando el padre actualiza las cantidades del mismo rubro tras guardar.
  useEffect(() => {
    setCantidad('');
    setObservaciones('');
    setMessage(null);
    setHistorial([]);
    if (rubro?.id) {
      loadHistorial(rubro.id);
    }
  }, [rubro?.id]);

  const loadHistorial = async (idRubro) => {
    try {
      setLoadingHistorial(true);
      const data = await fetchAvancesPorRubro(idRubro);
      setHistorial(data || []);
    } catch (err) {
      console.error('Error al cargar historial', err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  if (!rubro) {
    return <div className="text-white text-center p-4">Seleccione un rubro para continuar.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cantidad || parseFloat(cantidad) <= 0) return alert('Ingrese una cantidad válida mayor a 0');
    
    setIsSubmitting(true);
    setMessage(null);
    const payload = {
      idRubro: rubro.id,
      idProyecto: rubro.idProyecto,
      cantidadEjecutada: parseFloat(cantidad),
      observaciones: observaciones,
      fechaRegistro: new Date().toISOString()
    };

    try {
      const result = await onGuardar(payload);
      if (result && result.success) {
        setMessage({ type: 'success', text: result.message });
        setCantidad('');
        setObservaciones('');
        // Recargar historial para ver el nuevo avance
        loadHistorial(rubro.id);
      } else {
         setMessage({ type: 'error', text: result?.message || 'Error desconocido' });
      }
    } catch (error) {
       setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendiente = parseFloat(rubro.cantidadPresupuestada || 0) - parseFloat(rubro.cantidadEjecutada || 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full bg-white border border-[#D1D5DB] rounded-[12px] shadow-sm p-5 sm:p-8">
        <h2 className="text-xl font-semibold text-[#2F3A45] mb-6">Detalles del Avance</h2>
        
        <div className="bg-[#F7F9FC] p-4 rounded-[10px] mb-6 border border-[#D1D5DB]">
          <h3 className="text-base font-semibold text-[#1F4E79]">{rubro.codigo} - {rubro.descripcion}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Pendiente: <span className="text-[#111827] font-bold text-lg">{pendiente.toFixed(2)} {rubro.unidad}</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div className="bg-[#1F4E79] h-2.5 rounded-full" style={{ width: `${Math.min(100, ((parseFloat(rubro.cantidadEjecutada || 0) / parseFloat(rubro.cantidadPresupuestada || 1)) * 100))}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            Ejecutado: {parseFloat(rubro.cantidadEjecutada || 0).toFixed(2)} / {parseFloat(rubro.cantidadPresupuestada || 0).toFixed(2)} {rubro.unidad}
          </p>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-[10px] font-medium text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="cantidad" className="text-sm font-medium text-[#2F3A45]">
              Cantidad a Reportar ({rubro.unidad})
            </label>
            <input 
              type="number" 
              id="cantidad"
              inputMode="decimal"
              step="0.01"
              value={cantidad} 
              onChange={(e) => setCantidad(e.target.value)} 
              className="w-full h-[52px] px-4 rounded-[10px] bg-white text-[#111827] text-lg border border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79] focus:outline-none transition-all"
              placeholder="0.00"
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="observaciones" className="text-sm font-medium text-[#2F3A45]">
              Observaciones (Opcional)
            </label>
            <textarea 
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-4 rounded-[10px] bg-white text-[#111827] text-sm border border-[#D1D5DB] focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79] focus:outline-none transition-all resize-none"
              rows="3"
              placeholder="Detalles del avance..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="w-full mt-2 h-[52px] bg-[#1F4E79] hover:bg-[#153a5c] active:bg-[#0f2a42] text-white font-medium rounded-[10px] text-base transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Registrar Avance'}
          </button>
        </form>
      </div>

      <div className="w-full bg-white border border-[#D1D5DB] rounded-[12px] shadow-sm p-5 sm:p-8">
        <h2 className="text-lg font-semibold text-[#2F3A45] mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/-2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1F4E79]">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Historial de Registros
        </h2>
        
        {loadingHistorial ? (
          <p className="text-sm text-gray-500 text-center py-4">Cargando historial...</p>
        ) : historial.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-[8px] border border-gray-100">
            Aún no hay avances registrados para este rubro.
          </p>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {historial.map((avance) => (
              <div key={avance.id} className="p-3 border border-gray-200 rounded-[8px] hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-[#1F4E79]">+{parseFloat(avance.cantidadAvance).toFixed(2)} {rubro.unidad}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {new Date(avance.fechaRegistro).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-1 flex justify-between">
                  <span>Por: {avance.residente ? `${avance.residente.nombre} ${avance.residente.apellido}` : 'Desconocido'}</span>
                  <span className={`font-medium ${avance.estado === 'VALIDATED' ? 'text-green-600' : 'text-amber-600'}`}>
                    {avance.estado === 'VALIDATED' ? 'Validado' : 'Pendiente'}
                  </span>
                </div>
                {avance.notas && (
                  <p className="text-sm text-gray-700 italic border-l-2 border-gray-300 pl-2 mt-2">"{avance.notas}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistroAvanceMobile;
