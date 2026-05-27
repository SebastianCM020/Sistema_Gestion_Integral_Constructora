import React, { useState, useEffect, useRef } from 'react';
import { fetchAvancesPorRubro } from '../../services/offlineSyncService';
import storageService from '../../services/storage.service';
import { avancesLocalService } from '../../db/avancesLocalService';
import { Camera, Image as ImageIcon, X, CheckCircle2, AlertCircle, Clock, CloudOff, ArrowLeftRight } from 'lucide-react';
import CameraModal from './CameraModal';

const RegistroAvanceMobile = ({ rubro, onGuardar }) => {
  const [cantidad, setCantidad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  
  // Estados para Evidencia (Sprint 5)
  const [evidencia, setEvidencia] = useState(null);
  const [evidenciaPreview, setEvidenciaPreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedEvidencia, setSelectedEvidencia] = useState(null); // Para ver imagen en pantalla completa
  const galleryInputRef = useRef(null);

  // Solo resetea el formulario cuando cambia el RUBRO seleccionado (por id)
  useEffect(() => {
    setCantidad('');
    setObservaciones('');
    setEvidencia(null);
    setEvidenciaPreview(null);
    setMessage(null);
    setHistorial([]);
    if (rubro?.id) {
      loadHistorial(rubro.id);
    }
  }, [rubro?.id]);

  const loadHistorial = async (idRubro) => {
    try {
      setLoadingHistorial(true);
      
      // 1. Obtener avances del servidor
      const serverData = await fetchAvancesPorRubro(idRubro);
      
      // 2. Obtener avances locales (pendientes/error) del rubro — OMITIR los ya sincronizados
      const allLocal = await avancesLocalService.getAllLocal();
      const localForRubro = allLocal.filter(a => a.idRubro === idRubro && a.sync_status !== 'synced');
      
      // Combinar (locales primero)
      setHistorial([...localForRubro, ...(serverData || [])]);
    } catch (err) {
      console.error('Error al cargar historial', err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setMessage(null);
      
      // Compresión local (JPG < 5MB) - Sprint 5
      const compressedBlob = await storageService.compressImage(file);
      
      setEvidencia(compressedBlob);
      setEvidenciaPreview(URL.createObjectURL(compressedBlob));
    } catch (err) {
      console.error('Error al procesar imagen:', err);
      setMessage({ type: 'error', text: 'Error al procesar la imagen. Intente con otra.' });
    } finally {
      setIsCompressing(false);
    }
  };

  // Captura directa desde el modal de cámara (recibe un Blob)
  const handleCameraCapture = async (blob) => {
    try {
      setIsCompressing(true);
      setMessage(null);
      const compressedBlob = await storageService.compressImage(blob);
      setEvidencia(compressedBlob);
      setEvidenciaPreview(URL.createObjectURL(compressedBlob));
    } catch (err) {
      console.error('Error al procesar captura de cámara:', err);
      setMessage({ type: 'error', text: 'Error al procesar la foto. Intente de nuevo.' });
    } finally {
      setIsCompressing(false);
    }
  };

  const removeEvidencia = () => {
    setEvidencia(null);
    setEvidenciaPreview(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cantidad || parseFloat(cantidad) <= 0) return alert('Ingrese una cantidad válida mayor a 0');
    
    // Validación Sprint 5: Evidencia obligatoria
    if (!evidencia) {
      return setMessage({ type: 'error', text: 'La evidencia fotográfica es obligatoria para registrar el avance.' });
    }

    setIsSubmitting(true);
    setMessage(null);

    // Preparar FormData para soportar el archivo (multipart/form-data)
    const formData = new FormData();
    formData.append('idRubro', rubro.id);
    formData.append('idProyecto', rubro.idProyecto);
    formData.append('cantidadEjecutada', parseFloat(cantidad));
    formData.append('observaciones', observaciones);
    formData.append('fechaRegistro', new Date().toISOString());
    formData.append('evidencia', evidencia, 'evidencia.jpg');

    try {
      // Pasamos el FormData al padre
      const result = await onGuardar(formData);
      
      if (result && result.success) {
        setMessage({ 
          type: 'success', 
          text: result.offline 
            ? '📶 Guardado localmente. Se sincronizará al recuperar conexión.' 
            : '✅ Avance registrado correctamente.' 
        });
        setCantidad('');
        setObservaciones('');
        removeEvidencia();
        // Recargar historial para ver el nuevo avance
        loadHistorial(rubro.id);
      } else {
         setMessage({
           type: 'error',
           text: result?.message || 'Error desconocido',
           requiresChangeOrder: result?.code === 'REQUIRES_CHANGE_ORDER'
         });
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
          <div className={`p-4 mb-6 rounded-[10px] font-medium text-sm flex flex-col gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            <div className="flex items-center gap-3">
              {message.type === 'error' ? <AlertCircle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
              <span>{message.text}</span>
            </div>
            {message.requiresChangeOrder && (
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/module/change-orders?idProyecto=${rubro.idProyecto}&idRubro=${rubro.id}`;
                }}
                className="mt-1 self-start inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-[6px] text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                <ArrowLeftRight size={12} />
                Solicitar Orden de Cambio
              </button>
            )}
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

          {/* Sección de Evidencia Fotográfica (Sprint 5) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#2F3A45]">
              Evidencia Fotográfica <span className="text-red-500">*</span>
            </label>
            
            {/* Input dedicado a la GALERÍA (sin capture) */}
            <input 
              type="file" 
              accept="image/*"
              ref={galleryInputRef}
              onChange={handleCapture}
              className="hidden"
            />

            {!evidenciaPreview ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-[#D1D5DB] rounded-[12px] hover:border-[#1F4E79] hover:bg-blue-50 transition-all text-gray-500 hover:text-[#1F4E79]"
                >
                  <Camera size={24} />
                  <span className="text-xs font-medium">Cámara</span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current.click()}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-[#D1D5DB] rounded-[12px] hover:border-[#1F4E79] hover:bg-blue-50 transition-all text-gray-500 hover:text-[#1F4E79]"
                >
                  <ImageIcon size={24} />
                  <span className="text-xs font-medium">Galería</span>
                </button>
              </div>
            ) : (
              <div className="relative group">
                <img 
                  src={evidenciaPreview} 
                  alt="Vista previa" 
                  className="w-full h-48 object-cover rounded-[12px] border border-[#D1D5DB]"
                />
                <button
                  type="button"
                  onClick={removeEvidencia}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
                {isCompressing && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-[12px]">
                    <span className="text-xs font-semibold text-[#1F4E79] animate-pulse">Procesando...</span>
                  </div>
                )}
              </div>
            )}
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
              rows="2"
              placeholder="Detalles del avance..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="w-full mt-2 h-[52px] bg-[#1F4E79] hover:bg-[#153a5c] active:bg-[#0f2a42] text-white font-medium rounded-[10px] text-base transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || isCompressing}
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
                  <div className="flex items-center gap-2">
                    {avance.evidencias && avance.evidencias.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedEvidencia(avance.evidencias[0].urlImagen)}
                        className="text-xs text-[#1F4E79] hover:bg-blue-50 px-2 py-1.5 border border-[#1F4E79] rounded-[6px] flex items-center gap-1 transition-colors"
                        title="Ver evidencia"
                      >
                        <ImageIcon size={13} />
                        <span>Ver evidencia</span>
                      </button>
                    )}
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {new Date(avance.fechaRegistro).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-1 flex justify-between items-center">
                  <span>Por: {avance.residente ? `${avance.residente.nombre} ${avance.residente.apellido}` : (avance.sync_status ? 'Usted (Local)' : 'Desconocido')}</span>
                  
                  {/* Estados de Sincronización Sprint 5 */}
                  <div className="flex items-center gap-1.5">
                    {avance.sync_status === 'pending' && (
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <Clock size={12} /> Pendiente
                      </span>
                    )}
                    {avance.sync_status === 'error' && (
                      <span className="flex items-center gap-1 text-red-600 font-medium" title={avance.sync_error}>
                        <CloudOff size={12} /> Error
                      </span>
                    )}
                    {!avance.sync_status && (
                      <span className={`flex items-center gap-1 font-medium ${avance.estado === 'VALIDATED' ? 'text-green-600' : 'text-[#1F4E79]'}`}>
                        {avance.estado === 'VALIDATED' ? (
                          <><CheckCircle2 size={12} /> Validado</>
                        ) : (
                          'Sincronizado'
                        )}
                      </span>
                    )}
                  </div>
                </div>
                {avance.notas && (
                  <p className="text-sm text-gray-700 italic border-l-2 border-gray-300 pl-2 mt-2">"{avance.notas}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cámara nativo con getUserMedia */}
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />

      {/* Modal para ver evidencia a pantalla completa */}
      {selectedEvidencia && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedEvidencia(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
          >
            <X size={32} />
          </button>
          <img
            src={selectedEvidencia}
            alt="Evidencia"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default RegistroAvanceMobile;
