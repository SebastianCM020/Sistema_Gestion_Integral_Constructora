// ─────────────────────────────────────────────────────────────────────────────
// CatalogoMaterialesView.jsx — HU-02: Catálogo de Materiales e Insumos
// Roles: Admin (CRUD completo), Bodeguero/Residente (solo lectura)
// Offline: muestra datos del caché local con indicador de estado
// ─────────────────────────────────────────────────────────────────────────────

import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  Search, Plus, Pencil, Trash2, Tag, Package, Wifi, WifiOff,
  RefreshCw, AlertCircle, CheckCircle, X, ChevronDown,
} from 'lucide-react';
import { AuthContext } from '../../store/AuthContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import {
  fetchMateriales, fetchCategorias, crearMaterial, actualizarMaterial, eliminarMaterial,
} from '../../services/materiales.service';

// ── Constantes ────────────────────────────────────────────────────────────────
const UNIDADES = ['unidad', 'kg', 'g', 'ton', 'm', 'm²', 'm³', 'l', 'galón', 'saco', 'rollo', 'par'];

// ── Sub-componente: Badge de estado de red ────────────────────────────────────
const NetworkBadge = ({ isOnline, fromCache }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
      ${isOnline
        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
      }`}
  >
    {isOnline
      ? <><Wifi size={12} /> En línea</>
      : <><WifiOff size={12} /> Sin conexión {fromCache && '— mostrando caché'}</>
    }
  </span>
);

// ── Sub-componente: Modal de formulario ───────────────────────────────────────
const MaterialFormModal = ({ material, categorias, onClose, onSave }) => {
  const esEdicion = !!material?.id;
  const [form, setForm]   = useState({
    codigo:      material?.codigo      ?? '',
    nombre:      material?.nombre      ?? '',
    categoria:   material?.categoria   ?? '',
    unidad:      material?.unidad      ?? '',
    descripcion: material?.descripcion ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.codigo || !form.nombre || !form.categoria || !form.unidad) {
      setError('Los campos Código, Nombre, Categoría y Unidad son obligatorios.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700/60 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {esEdicion ? 'Editar Material' : 'Nuevo Material'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {esEdicion ? `ID: ${material.id.slice(0, 8)}...` : 'Complete todos los campos obligatorios'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Código <span className="text-red-400">*</span>
              </label>
              <input
                id="mat-codigo"
                value={form.codigo}
                onChange={handleChange('codigo')}
                disabled={esEdicion} // El código no cambia en edición
                placeholder="ej: MAT-001"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                           text-sm placeholder-gray-500 focus:outline-none focus:border-icaro-500
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Unidad de medida <span className="text-red-400">*</span>
              </label>
              <select
                id="mat-unidad"
                value={form.unidad}
                onChange={handleChange('unidad')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                           text-sm focus:outline-none focus:border-icaro-500 appearance-none"
              >
                <option value="">Seleccionar...</option>
                {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Nombre del material <span className="text-red-400">*</span>
            </label>
            <input
              id="mat-nombre"
              value={form.nombre}
              onChange={handleChange('nombre')}
              placeholder="ej: Cemento Portland Tipo I"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                         text-sm placeholder-gray-500 focus:outline-none focus:border-icaro-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Categoría <span className="text-red-400">*</span>
            </label>
            <input
              id="mat-categoria"
              list="categorias-list"
              value={form.categoria}
              onChange={handleChange('categoria')}
              placeholder="ej: Cemento, Acero, Eléctrico..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                         text-sm placeholder-gray-500 focus:outline-none focus:border-icaro-500"
            />
            <datalist id="categorias-list">
              {categorias.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Descripción <span className="text-gray-500">(opcional)</span>
            </label>
            <textarea
              id="mat-descripcion"
              value={form.descripcion}
              onChange={handleChange('descripcion')}
              rows={2}
              placeholder="Especificaciones técnicas del material..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                         text-sm placeholder-gray-500 focus:outline-none focus:border-icaro-500 resize-none"
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg border border-gray-600 text-gray-300
                         hover:bg-gray-700 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="mat-form-submit"
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-lg bg-icaro-700 hover:bg-icaro-500 text-white
                         text-sm font-medium transition-colors disabled:opacity-50 flex items-center
                         justify-center gap-2"
            >
              {loading && <RefreshCw size={14} className="animate-spin" />}
              {esEdicion ? 'Guardar cambios' : 'Crear material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Vista principal ───────────────────────────────────────────────────────────
export function CatalogoMaterialesView() {
  const { user }      = useContext(AuthContext);
  const { isOnline }  = useNetworkStatus();
  const isAdmin       = user?.rol === 'Administrador del Sistema';

  // State
  const [materiales,   setMateriales]   = useState([]);
  const [categorias,   setCategorias]   = useState([]);
  const [busqueda,     setBusqueda]     = useState('');
  const [catFiltro,    setCatFiltro]    = useState('');
  const [loading,      setLoading]      = useState(true);
  const [fromCache,    setFromCache]    = useState(false);
  const [cacheVacia,   setCacheVacia]   = useState(false);
  const [modal,        setModal]        = useState(null); // null | { tipo: 'nuevo'|'editar'|'eliminar', material? }
  const [toast,        setToast]        = useState(null); // { tipo: 'ok'|'error', msg }
  const [eliminando,   setEliminando]   = useState(null); // UUID del material a eliminar

  // ── Carga de datos ──────────────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [resMats, resCats] = await Promise.all([
        fetchMateriales({ categoria: catFiltro, busqueda, isOnline }),
        fetchCategorias(isOnline),
      ]);
      setMateriales(resMats.data);
      setFromCache(resMats.fromCache);
      setCacheVacia(resMats.cacheVacia ?? false);
      setCategorias(resCats);
    } catch (err) {
      mostrarToast('error', 'Error cargando materiales: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [catFiltro, busqueda, isOnline]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Handlers CRUD ───────────────────────────────────────────────────────────
  const handleGuardar = async (formData) => {
    if (modal?.material?.id) {
      await actualizarMaterial(modal.material.id, formData);
      mostrarToast('ok', 'Material actualizado correctamente.');
    } else {
      await crearMaterial(formData);
      mostrarToast('ok', 'Material creado en el catálogo.');
    }
    cargarDatos();
  };

  const handleEliminar = async (id) => {
    setEliminando(id);
    try {
      await eliminarMaterial(id);
      mostrarToast('ok', 'Material desactivado del catálogo.');
      cargarDatos();
    } catch (err) {
      mostrarToast('error', err.response?.data?.error ?? 'Error eliminando material.');
    } finally {
      setEliminando(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* ── Header de la vista ── */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-icaro-700/20 border border-icaro-700/30">
              <Package size={20} className="text-icaro-500" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Catálogo de Materiales</h1>
              <p className="text-xs text-gray-400">HU-02 — Gestión de insumos base</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NetworkBadge isOnline={isOnline} fromCache={fromCache} />
            <button
              id="btn-refresh-materiales"
              onClick={cargarDatos}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 transition-colors"
              title="Actualizar"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            {isAdmin && (
              <button
                id="btn-nuevo-material"
                onClick={() => setModal({ tipo: 'nuevo' })}
                className="flex items-center gap-2 px-4 py-2 bg-icaro-700 hover:bg-icaro-500
                           text-white text-sm font-medium rounded-lg transition-all active:scale-95"
              >
                <Plus size={16} /> Nuevo material
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Alerta de caché vacía ── */}
        {cacheVacia && !isOnline && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
            <WifiOff size={18} className="shrink-0" />
            <span>
              Sin conexión y sin datos en caché. Conéctate a internet para cargar el catálogo.
            </span>
          </div>
        )}

        {/* ── Filtros de búsqueda ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              id="mat-busqueda"
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl
                         text-sm text-white placeholder-gray-500 focus:outline-none focus:border-icaro-500"
            />
          </div>

          {/* Filtro por categoría */}
          <div className="relative">
            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              id="mat-filtro-categoria"
              value={catFiltro}
              onChange={(e) => setCatFiltro(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm
                         text-white focus:outline-none focus:border-icaro-500 appearance-none min-w-[180px]"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* ── Tabla de materiales ── */}
        <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl overflow-hidden">
          {/* Stats header */}
          <div className="px-6 py-3 border-b border-gray-700/50 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {loading
                ? 'Cargando...'
                : `${materiales.length} material${materiales.length !== 1 ? 'es' : ''} encontrado${materiales.length !== 1 ? 's' : ''}`
              }
            </span>
            {fromCache && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <WifiOff size={11} /> Datos del caché local
              </span>
            )}
          </div>

          {loading ? (
            // Skeleton loader
            <div className="divide-y divide-gray-700/30">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-24" />
                  <div className="h-4 bg-gray-700 rounded animate-pulse flex-1" />
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-32" />
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-16" />
                </div>
              ))}
            </div>
          ) : materiales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Package size={48} className="mb-3 opacity-30" />
              <p className="font-medium">No se encontraron materiales</p>
              <p className="text-sm mt-1">
                {busqueda || catFiltro ? 'Prueba con otros filtros.' : 'Agrega el primer material al catálogo.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Código</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoría</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Unidad</th>
                    {isAdmin && (
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {materiales.map((mat) => (
                    <tr
                      key={mat.id}
                      className="hover:bg-gray-800/40 transition-colors group"
                    >
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-xs bg-gray-700/60 text-icaro-300 px-2 py-0.5 rounded">
                          {mat.codigo}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-medium text-white">{mat.nombre}</span>
                        {mat.descripcion && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{mat.descripcion}</p>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs
                                         bg-icaro-900/60 text-icaro-300 border border-icaro-700/30">
                          <Tag size={10} />
                          {mat.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-300">{mat.unidad}</td>
                      {isAdmin && (
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              id={`btn-editar-${mat.id}`}
                              onClick={() => setModal({ tipo: 'editar', material: mat })}
                              className="p-1.5 rounded-lg hover:bg-icaro-700/30 text-gray-400 hover:text-icaro-300"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              id={`btn-eliminar-${mat.id}`}
                              onClick={() => handleEliminar(mat.id)}
                              disabled={eliminando === mat.id}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400
                                         disabled:opacity-50"
                              title="Desactivar"
                            >
                              {eliminando === mat.id
                                ? <RefreshCw size={15} className="animate-spin" />
                                : <Trash2 size={15} />
                              }
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal de formulario ── */}
      {modal && (
        <MaterialFormModal
          material={modal.material}
          categorias={categorias}
          onClose={() => setModal(null)}
          onSave={handleGuardar}
        />
      )}

      {/* ── Toast de notificación ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3
                         rounded-xl border shadow-xl text-sm font-medium transition-all
                         ${toast.tipo === 'ok'
                           ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-300'
                           : 'bg-red-900/90 border-red-500/40 text-red-300'
                         }`}>
          {toast.tipo === 'ok'
            ? <CheckCircle size={16} />
            : <AlertCircle size={16} />
          }
          {toast.msg}
        </div>
      )}
    </div>
  );
}
