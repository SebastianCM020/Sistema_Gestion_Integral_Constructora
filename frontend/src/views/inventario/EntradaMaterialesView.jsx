// ─────────────────────────────────────────────────────────────────────────────
// EntradaMaterialesView.jsx — HU-03: Registro de Entrada de Materiales
// Rol principal: Bodeguero
// CA: El sistema permite ingresar stock inicial y actualiza el total disponible.
// Offline: Si no hay red, guarda el movimiento localmente con sync_status='pending'.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  PackagePlus, Search, ArrowDownCircle, ArrowUpCircle, SlidersHorizontal,
  Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, ChevronDown,
  Hash, ClipboardList, Clock,
} from 'lucide-react';
import { AuthContext } from '../../store/AuthContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { fetchMateriales } from '../../services/materiales.service';
import { registrarMovimiento, fetchMovimientos, fetchInventario } from '../../services/bodega.service';

// ── Constantes ────────────────────────────────────────────────────────────────
const TIPO_LABELS = {
  ENTRADA: { label: 'Entrada de stock',  icon: ArrowDownCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  SALIDA:  { label: 'Salida de stock',   icon: ArrowUpCircle,   color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30' },
  AJUSTE:  { label: 'Ajuste de stock',   icon: SlidersHorizontal, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
};

// ── Sub-componente: Indicador de red ──────────────────────────────────────────
const NetworkBadge = ({ isOnline }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
    ${isOnline
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    }`}>
    {isOnline ? <><Wifi size={11} />En línea</> : <><WifiOff size={11} />Offline — se guardará localmente</>}
  </span>
);

// ── Sub-componente: Selector de proyecto (simplificado) ───────────────────────
// En producción esto usaría los proyectos del usuario desde el AuthContext.
// Por ahora, el bodeguero ingresa el ID del proyecto.
const ProyectoSelector = ({ value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1.5">
      ID del Proyecto <span className="text-red-400">*</span>
    </label>
    <div className="relative">
      <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <input
        id="mov-proyecto-id"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder="UUID del proyecto (ej: a1b2c3d4-...)"
        className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm
                   text-white placeholder-gray-500 focus:outline-none focus:border-icaro-500 font-mono"
      />
    </div>
    <p className="text-xs text-gray-600 mt-1">
      Este campo lo obtendrá del selector de proyecto en el Sprint siguiente.
    </p>
  </div>
);

// ── Vista principal ───────────────────────────────────────────────────────────
export function EntradaMaterialesView() {
  const { user }     = useContext(AuthContext);
  const { isOnline } = useNetworkStatus();

  // ── State del formulario ────────────────────────────────────────────────────
  const [idProyecto,      setIdProyecto]      = useState('');
  const [materiales,      setMateriales]      = useState([]);
  const [matSeleccionado, setMatSeleccionado] = useState(null);
  const [busquedaMat,     setBusquedaMat]     = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [tipoMovimiento,  setTipoMovimiento]  = useState('ENTRADA');
  const [cantidad,        setCantidad]        = useState('');
  const [observacion,     setObservacion]     = useState('');
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState('');
  const [toast,           setToast]           = useState(null);

  // ── State del historial ─────────────────────────────────────────────────────
  const [historial,       setHistorial]       = useState([]);
  const [loadingHistorial,setLoadingHistorial]= useState(false);
  const [inventario,      setInventario]      = useState([]);

  // ── Carga de materiales para el selector ───────────────────────────────────
  useEffect(() => {
    fetchMateriales({ busqueda: busquedaMat, isOnline })
      .then((res) => setMateriales(res.data))
      .catch(console.error);
  }, [busquedaMat, isOnline]);

  // ── Carga del historial cuando cambia el proyecto ──────────────────────────
  const cargarHistorial = useCallback(async () => {
    if (!idProyecto) return;
    setLoadingHistorial(true);
    try {
      const [resHist, resInv] = await Promise.all([
        fetchMovimientos(idProyecto, { isOnline }),
        fetchInventario(idProyecto, isOnline),
      ]);
      setHistorial(resHist.data ?? []);
      setInventario(resInv.data ?? []);
    } catch { /* silencioso */ }
    finally { setLoadingHistorial(false); }
  }, [idProyecto, isOnline]);

  useEffect(() => { cargarHistorial(); }, [cargarHistorial]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const resetForm = () => {
    setMatSeleccionado(null);
    setBusquedaMat('');
    setCantidad('');
    setObservacion('');
    setError('');
  };

  // ── Selección de material desde el dropdown ────────────────────────────────
  const seleccionarMaterial = (mat) => {
    setMatSeleccionado(mat);
    setBusquedaMat(mat.nombre);
    setMostrarDropdown(false);
  };

  // ── Submit del formulario ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!idProyecto)       { setError('Debes especificar el ID del proyecto.'); return; }
    if (!matSeleccionado)  { setError('Debes seleccionar un material del catálogo.'); return; }
    const cantNum = parseFloat(cantidad);
    if (!cantNum || cantNum <= 0) { setError('La cantidad debe ser un número positivo.'); return; }

    setSubmitting(true);
    try {
      const resultado = await registrarMovimiento({
        idProyecto,
        idMaterial:     matSeleccionado.id,
        idUsuario:      user?.id ?? 'local',
        tipoMovimiento,
        cantidad:       cantNum,
        observacion,
        isOnline,
      });

      mostrarToast(
        'ok',
        resultado.fromCache
          ? `📦 ${resultado.message}`
          : `✅ ${resultado.message}`
      );
      resetForm();
      cargarHistorial();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Error registrando movimiento.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">

      {/* ── Header ── */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <PackagePlus size={20} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Entrada de Materiales</h1>
              <p className="text-xs text-gray-400">HU-03 — Bodeguero: {user?.nombre} {user?.apellido}</p>
            </div>
          </div>
          <NetworkBadge isOnline={isOnline} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[1fr_420px] gap-6">

        {/* ── PANEL IZQUIERDO: Formulario de registro ── */}
        <div className="space-y-5">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-6 space-y-5"
          >
            <h2 className="font-semibold text-white flex items-center gap-2">
              <ClipboardList size={16} className="text-icaro-400" />
              Registrar movimiento
            </h2>

            {/* Error general */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30
                              text-red-400 text-sm">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Proyecto */}
            <ProyectoSelector value={idProyecto} onChange={setIdProyecto} />

            {/* Tipo de movimiento */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Tipo de movimiento <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TIPO_LABELS).map(([tipo, meta]) => {
                  const Icon = meta.icon;
                  const activo = tipoMovimiento === tipo;
                  return (
                    <button
                      key={tipo}
                      type="button"
                      id={`btn-tipo-${tipo.toLowerCase()}`}
                      onClick={() => setTipoMovimiento(tipo)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs
                                  font-medium transition-all ${activo
                                    ? `${meta.bg} ${meta.color} border-current`
                                    : 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                                  }`}
                    >
                      <Icon size={18} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de material con búsqueda */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Material <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="mov-busqueda-material"
                  type="text"
                  value={busquedaMat}
                  onChange={(e) => {
                    setBusquedaMat(e.target.value);
                    setMatSeleccionado(null);
                    setMostrarDropdown(true);
                  }}
                  onFocus={() => setMostrarDropdown(true)}
                  placeholder="Buscar material por nombre o código..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl
                             text-sm text-white placeholder-gray-500 focus:outline-none focus:border-icaro-500"
                />
              </div>

              {/* Dropdown de resultados */}
              {mostrarDropdown && materiales.length > 0 && !matSeleccionado && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-gray-800 border border-gray-600
                                rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                  {materiales.slice(0, 8).map((mat) => (
                    <button
                      key={mat.id}
                      type="button"
                      id={`opt-mat-${mat.id}`}
                      onClick={() => seleccionarMaterial(mat)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700
                                 text-left transition-colors"
                    >
                      <div>
                        <span className="text-sm text-white font-medium">{mat.nombre}</span>
                        <span className="block text-xs text-gray-500">{mat.categoria}</span>
                      </div>
                      <span className="font-mono text-xs bg-gray-700 text-icaro-300 px-2 py-0.5 rounded ml-2 shrink-0">
                        {mat.unidad}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Material seleccionado */}
              {matSeleccionado && (
                <div className="mt-2 flex items-center gap-3 p-3 rounded-xl bg-icaro-900/40
                                border border-icaro-700/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{matSeleccionado.nombre}</p>
                    <p className="text-xs text-gray-400">{matSeleccionado.categoria} · {matSeleccionado.unidad}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMatSeleccionado(null); setBusquedaMat(''); }}
                    className="text-gray-500 hover:text-gray-300 text-xs"
                  >
                    Cambiar
                  </button>
                </div>
              )}
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Cantidad{matSeleccionado ? ` (${matSeleccionado.unidad})` : ''}
                <span className="text-red-400"> *</span>
              </label>
              <input
                id="mov-cantidad"
                type="number"
                min="0.01"
                step="0.01"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="ej: 50"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm
                           text-white placeholder-gray-500 focus:outline-none focus:border-icaro-500"
              />
            </div>

            {/* Observación */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Observación <span className="text-gray-600">(opcional)</span>
              </label>
              <textarea
                id="mov-observacion"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                rows={2}
                placeholder="ej: Stock inicial del proyecto, Proveedor XYZ..."
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm
                           text-white placeholder-gray-500 focus:outline-none focus:border-icaro-500 resize-none"
              />
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              id="btn-registrar-movimiento"
              disabled={submitting}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all
                          flex items-center justify-center gap-2 active:scale-[0.98]
                          ${tipoMovimiento === 'ENTRADA'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : tipoMovimiento === 'SALIDA'
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : 'bg-amber-600 hover:bg-amber-500 text-white'
                          } disabled:opacity-50`}
            >
              {submitting
                ? <><RefreshCw size={15} className="animate-spin" /> Registrando...</>
                : <>
                    {TIPO_LABELS[tipoMovimiento].icon && React.createElement(TIPO_LABELS[tipoMovimiento].icon, { size: 15 })}
                    Registrar {TIPO_LABELS[tipoMovimiento].label}
                    {!isOnline && <span className="text-xs opacity-70">(offline)</span>}
                  </>
              }
            </button>
          </form>

          {/* ── Stock actual del proyecto ── */}
          {inventario.length > 0 && (
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-700/50">
                <h3 className="text-sm font-semibold text-white">Stock actual del proyecto</h3>
              </div>
              <div className="divide-y divide-gray-700/30">
                {inventario.map((item) => (
                  <div key={`${item.id_material}-${item.id_proyecto}`}
                       className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.material?.nombre ?? item.id_material}
                      </p>
                      <p className="text-xs text-gray-500">{item.material?.categoria}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${
                        parseFloat(item.cantidad_disponible ?? item.cantidadDisponible) === 0
                          ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {parseFloat(item.cantidad_disponible ?? item.cantidadDisponible ?? 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        {item.material?.unidad}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── PANEL DERECHO: Historial de movimientos ── */}
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl overflow-hidden h-fit">
          <div className="px-5 py-3 border-b border-gray-700/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              Historial reciente
            </h3>
            <button
              id="btn-refresh-historial"
              onClick={cargarHistorial}
              disabled={loadingHistorial}
              className="p-1 rounded-lg hover:bg-gray-700 text-gray-500"
            >
              <RefreshCw size={13} className={loadingHistorial ? 'animate-spin' : ''} />
            </button>
          </div>

          {!idProyecto ? (
            <div className="px-5 py-8 text-center text-gray-600 text-sm">
              <Hash size={32} className="mx-auto mb-2 opacity-30" />
              Ingresa un ID de proyecto para ver el historial
            </div>
          ) : loadingHistorial ? (
            <div className="divide-y divide-gray-700/30">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-5 py-3 flex gap-3">
                  <div className="w-6 h-6 bg-gray-700 rounded-full animate-pulse shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : historial.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-600 text-sm">
              <PackagePlus size={32} className="mx-auto mb-2 opacity-30" />
              Sin movimientos registrados
            </div>
          ) : (
            <div className="divide-y divide-gray-700/30 max-h-[600px] overflow-y-auto">
              {historial.slice(0, 30).map((mov) => {
                const tipo = TIPO_LABELS[mov.tipo_movimiento ?? mov.tipoMovimiento] ?? TIPO_LABELS.ENTRADA;
                const Icon = tipo.icon;
                const esPendiente = mov.sync_status === 'pending';
                return (
                  <div key={mov.id} className="px-5 py-3 flex gap-3 hover:bg-gray-800/30 transition-colors">
                    <div className={`p-1.5 rounded-full ${tipo.bg} shrink-0 mt-0.5`}>
                      <Icon size={12} className={tipo.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white truncate">
                          {mov.material?.nombre ?? mov.id_material}
                        </p>
                        <span className={`text-sm font-bold shrink-0 ${tipo.color}`}>
                          {tipoMovimiento === 'SALIDA' ? '-' : '+'}
                          {parseFloat(mov.cantidad).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          {new Date(mov.fecha_movimiento ?? mov.fechaMovimiento ?? mov.local_created_at).toLocaleString('es-EC', {
                            dateStyle: 'short', timeStyle: 'short',
                          })}
                        </span>
                        {esPendiente && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10
                                           border border-amber-500/20 rounded px-1.5 py-0.5">
                            <WifiOff size={9} /> Pendiente sync
                          </span>
                        )}
                      </div>
                      {mov.observacion && (
                        <p className="text-xs text-gray-600 mt-0.5 truncate">{mov.observacion}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm flex items-start gap-3 px-4 py-3
                         rounded-xl border shadow-xl text-sm font-medium
                         ${toast.tipo === 'ok'
                           ? 'bg-emerald-900/95 border-emerald-500/40 text-emerald-300'
                           : 'bg-red-900/95 border-red-500/40 text-red-300'
                         }`}>
          {toast.tipo === 'ok' ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
