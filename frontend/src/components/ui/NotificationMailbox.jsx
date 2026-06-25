import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Inbox, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchNotificaciones } from '../../services/compras.service.js';

export function NotificationMailbox({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleNotifClick = (notif) => {
    setIsOpen(false);
    if (currentUser.roleName === 'Presidente / Gerente' || currentUser.roleName === 'Administrador del Sistema') {
      const t = Date.now();
      navigate(`/module/review?t=${t}`);
    } else if (currentUser.roleName === 'Contador') {
      const t = Date.now();
      navigate(`/module/accounting-review?t=${t}`);
    } else if (currentUser.roleName === 'Bodeguero') {
      const projectId = notif.requerimiento?.idProyecto || '';
      const reqId = notif.requerimiento?.id || '';
      const t = Date.now();
      if (projectId) {
        navigate(`/module/inventory?idProyecto=${projectId}&idReq=${reqId}&t=${t}`);
      } else {
        navigate(`/module/inventory?t=${t}`);
      }
    } else {
      const projectId = notif.requerimiento?.idProyecto || '';
      if (projectId) {
        navigate(`/module/requirements?idProyecto=${projectId}`);
      } else {
        navigate('/module/requirements');
      }
    }
  };

  // Solo mostrar para Gerente, Residente, Admin, Contador y Bodeguero
  const showMailbox = [
    'Presidente / Gerente',
    'Residente',
    'Administrador del Sistema',
    'Auxiliar de Contabilidad',
    'Contador',
    'Bodeguero'
  ].includes(currentUser.roleName);

  const loadNotifications = async () => {
    if (!showMailbox) return;
    try {
      setLoading(true);
      const result = await fetchNotificaciones();
      const list = result.data || [];
      setNotifications(list);
      
      // Contar notificaciones que no han sido vistas/leídas en esta sesión
      setUnreadCount(list.length);
    } catch (error) {
      console.error('[NotificationMailbox] Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carga inicial
    loadNotifications();

    // Polling cada 60 s (no 15 s) para reducir carga de red
    // Se pausa automáticamente cuando la pestaña no está activa
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadNotifications();
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!showMailbox) return null;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Limpiar el contador de no leídos al abrir
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative inline-flex items-center ml-2" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#D1D5DB] bg-white text-[#2F3A45] hover:bg-[#F7F9FC] hover:text-[#1F4E79] transition-all duration-200 focus:outline-none"
        title="Buzón de Notificaciones"
      >
        <Bell size={18} className={unreadCount > 0 ? "animate-swing" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 mt-2 w-80 overflow-hidden rounded-[14px] border border-[#D1D5DB] bg-white/95 backdrop-blur shadow-[0_12px_40px_rgba(17,24,39,0.15)] animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3">
            <div className="flex items-center gap-2">
              <Inbox size={16} className="text-[#1F4E79]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2F3A45]">Buzón de Compra</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                loadNotifications();
              }}
              disabled={loading}
              className="text-gray-400 hover:text-[#1F4E79] transition-colors disabled:opacity-50"
              title="Refrescar"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="max-h-[280px] overflow-y-auto divide-y divide-[#D1D5DB]/50">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-xs text-gray-400">
                <RefreshCw size={14} className="animate-spin mr-2" />
                Cargando notificaciones...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F9FC] text-gray-400 mb-2">
                  <Inbox size={20} />
                </div>
                <p className="text-xs font-medium text-[#2F3A45]">No hay notificaciones</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {currentUser.roleName === 'Presidente / Gerente'
                    ? 'No hay requerimientos de compra pendientes de revisión.'
                    : currentUser.roleName === 'Contador'
                    ? 'No hay requerimientos pendientes de validación contable.'
                    : currentUser.roleName === 'Bodeguero'
                    ? 'No hay requerimientos aprobados listos para recepción.'
                    : 'Tus requerimientos no han tenido cambios de estado recientes.'}
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isApproved = notif.tipo === 'APROBADO' || notif.tipo === 'APPROVED';
                const isRejected = notif.tipo === 'RECHAZADO' || notif.tipo === 'REJECTED';
                
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className="p-3 hover:bg-[#F7F9FC]/70 transition-colors flex items-start gap-3 cursor-pointer"
                  >
                    <div className="mt-0.5 shrink-0">
                      {isApproved ? (
                        <CheckCircle2 size={16} className="text-[#16A34A]" />
                      ) : isRejected ? (
                        <AlertCircle size={16} className="text-[#DC2626]" />
                      ) : (
                        <Bell size={16} className="text-[#1F4E79]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#2F3A45]">{notif.titulo}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{notif.mensaje}</p>
                      <p className="text-[9px] text-gray-400 mt-1">
                        {new Date(notif.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(notif.fecha).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
