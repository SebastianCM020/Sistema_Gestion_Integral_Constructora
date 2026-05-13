import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Camera, RotateCcw, Check, AlertCircle } from 'lucide-react';

/**
 * Modal de Cámara nativo usando getUserMedia.
 * Abre la cámara trasera del dispositivo, muestra un visor en vivo,
 * permite capturar la foto y confirmarla antes de guardarla.
 */
const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setCapturedImage(null);
    setIsCameraReady(false);

    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      if (err.name === 'NotAllowedError') {
        setError('Permiso de cámara denegado. Habilítelo en la configuración del navegador.');
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara en el dispositivo.');
      } else {
        setError('No se pudo acceder a la cámara. Verifique los permisos.');
      }
    }
  }, []);

  // Iniciar/detener cámara con el ciclo de vida del modal
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setCapturedImage(null);
      setError(null);
    }
    return () => stopStream();
  }, [isOpen, startCamera, stopStream]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopStream();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (!capturedImage || !canvasRef.current) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
          onClose();
        }
      },
      'image/jpeg',
      0.85
    );
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm">
        <h3 className="text-white font-semibold text-base">Capturar Evidencia</h3>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Cerrar cámara"
        >
          <X size={20} />
        </button>
      </div>

      {/* Visor */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        {error ? (
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <p className="text-white/90 text-sm leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Foto capturada"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <p className="text-white/80 text-sm">Iniciando cámara...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controles */}
      <div className="px-4 py-5 bg-black/80 backdrop-blur-sm">
        {!error && !capturedImage && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={takePhoto}
              disabled={!isCameraReady}
              className="w-[72px] h-[72px] rounded-full border-4 border-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 hover:bg-white/10"
              aria-label="Tomar foto"
            >
              <Camera size={28} className="text-white" />
            </button>
          </div>
        )}

        {capturedImage && (
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={retakePhoto}
              className="flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <RotateCcw size={22} />
              <span className="text-xs font-medium">Repetir</span>
            </button>
            <button
              type="button"
              onClick={confirmPhoto}
              className="flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1F4E79] hover:bg-[#153a5c] text-white transition-colors"
            >
              <Check size={22} />
              <span className="text-xs font-medium">Usar foto</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraModal;
