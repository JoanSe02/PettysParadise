"use client"

import { MdMenu as IconMenu, MdHelpOutline as IconHelp, MdNotifications as IconNotifications } from "react-icons/md"
import { useState, useEffect, useRef } from "react"
import Logout from "../administrador/LogoutAdmin"
import "../stylos/Admin.css"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { Base64 } from "js-base64"

const UnifiedHeader = ({ toggleSidebar, userData }) => {
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const notificationsRef = useRef(null)
  const helpRef = useRef(null)
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:5000/api/auth/admin-notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        // Asignamos solo las notificaciones no leídas al estado
        setNotifications(response.data.notifications.filter(n => !n.read));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setShowHelp(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = notifications.length;

  const handleMarkAsRead = async (e, notificationId) => {
    e.preventDefault(); // Previene la navegación del Link padre
    e.stopPropagation(); // Detiene la propagación del evento

    const token = localStorage.getItem("token");
    if(!token) return;

    try {
      // Llama al backend para marcarla como leída (en este caso, la elimina)
      await axios.delete(`http://localhost:5000/api/auth/admin-notifications/${notificationId}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      // Actualiza el estado local para reflejar el cambio inmediatamente
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
        console.error("Error marcando la notificación como leída:", error);
    }
  };
  
  const handleNotificationClick = (notification) => {
      setShowNotifications(false);
      navigate(`/administrador/${Base64.encode("usuarios")}?highlight=${notification.userEmail}`);
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp)
  }

  const fullName = userData?.nombre && userData?.apellido ? `${userData.nombre} ${userData.apellido}` : ""
  
  return (
    <header className="unified-header" role="banner">
      {/* Left Section */}
      <div className="unified-header-left">
        <button className="unified-menu-toggle" onClick={toggleSidebar} aria-label="Abrir menú lateral" title="Menú">
          <IconMenu size={22} />
        </button>
        <div className="unified-header-branding">
          <div className="unified-header-brand-info">
            <h1 className="unified-header-brand-title">Panel de Administrador</h1>
            <span className="unified-header-brand-subtitle">Panel de Control</span>
          </div>
        </div>
      </div>

      {/* Center Section */}
      <div className="unified-header-center"></div>

      {/* Right Section */}
      <div className="unified-header-right">
        <div className="unified-notifications-container" ref={notificationsRef}>
          <button
            className="unified-quick-action-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notificaciones"
            title="Notificaciones"
          >
            <IconNotifications size={20} />
            {unreadCount > 0 && <span className="unified-notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="unified-notifications-dropdown">
              <div className="unified-notifications-header">
                <h3>Notificaciones</h3>
              </div>
              <div className="unified-notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="unified-notification-item"
                      onClick={() => handleNotificationClick(notif)}
                      role="button"
                      tabIndex="0"
                    >
                      <div className="unified-notification-content">
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                        <span className="unified-notification-time">
                          {new Date(notif.time).toLocaleString()}
                        </span>
                      </div>
                      
                    <button 
                      className="unified-notification-read-btn"
                      onClick={(e) => handleMarkAsRead(e, notif.id)}
                      title="Marcar como leído" // Tooltip que aparece al pasar el mouse
                    >
                      {/* El texto se elimina, el ícono se maneja con CSS */}
                    </button>
                    </div>
                  ))
                ) : (
                  <div className="unified-no-notifications">
                    <p>No hay notificaciones nuevas.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="unified-quick-actions">
          <div className="unified-help-container" ref={helpRef}>
            <button className="unified-quick-action-btn" onClick={toggleHelp} aria-label="Ayuda" title="Ayuda">
              <IconHelp size={20} />
            </button>

            {showHelp && (
              <div className="unified-help-dropdown">
                <div className="unified-help-header">
                  <h3>Documentación</h3>
                </div>
                <div className="unified-help-list">
                  <a
                    href="https://docs.google.com/document/d/12orKLFckyFBqGmvfWIyx2zBzMtIbFn8G/export?format=pdf"
                    download="Manual de Usuario.pdf"
                    className="unified-help-item"
                    onClick={() => setShowHelp(false)}
                  >
                    <div className="unified-help-content">
                      <h4>Manual de Usuario</h4>
                      <p>Guía completa para usuarios del sistema</p>
                    </div>
                  </a>
                  <a
                    href="https://docs.google.com/document/d/1CiOtc5_mVbrfI3X98kcLJPuRE0peE_4IUv72D6COOnQ/export?format=pdf"
                    download="Manual Técnico.pdf"
                    className="unified-help-item"
                    onClick={() => setShowHelp(false)}
                  >
                    <div className="unified-help-content">
                      <h4>Manual Técnico</h4>
                      <p>Documentación técnica del sistema</p>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="unified-user-menu">
          <div className="unified-header-user-info">
            <span className="unified-header-user-name">{fullName}</span>
          </div>
          <Logout />
        </div>
      </div>
    </header>
  )
}

export default UnifiedHeader;