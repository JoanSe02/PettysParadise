"use client"

import { MdMenu as IconMenu, MdHelpOutline as IconHelp } from "react-icons/md"
import { useState, useEffect, useRef } from "react"
import Logout from "../administrador/LogoutAdmin"
import "../stylos/Admin.css"

const UnifiedHeader = ({ toggleSidebar, userData }) => {
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showHelp, setShowHelp] = useState(false)

  const searchRef = useRef(null)
  const notificationsRef = useRef(null)
  const helpRef = useRef(null)

  useEffect(() => {
    // Simular notificaciones
    setNotifications([
      {
        id: 1,
        title: "Nueva cita programada",
        message: "María García ha programado una cita para mañana",
        time: "Hace 2 min",
        read: false,
        type: "appointment",
        priority: "high",
      },
      {
        id: 2,
        title: "Usuario registrado",
        message: "Juan Pérez se ha registrado en el sistema",
        time: "Hace 15 min",
        read: false,
        type: "user",
        priority: "medium",
      },
    ])

    // Actualizar hora cada minuto
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timeInterval)
  }, [])

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false)
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setShowHelp(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const toggleSearch = () => {
    setShowSearch(!showSearch)
    if (!showSearch) {
      setTimeout(() => searchRef.current?.querySelector("input")?.focus(), 100)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const toggleHelp = () => {
    setShowHelp(!showHelp)
  }

  // Tu código (incompleto)
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
        {/* Search */}
        <div className="unified-header-search" ref={searchRef}></div>

        {/* Notifications */}
        <div className="unified-notifications-container" ref={notificationsRef}></div>

        {/* Quick Actions */}
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

        {/* User Menu */}
        <div className="unified-user-menu">
          <div className="unified-header-user-info">
            <span className="unified-header-user-name">{fullName}</span>
          </div>
          <Logout />
        </div>
      </div>

      {/* Search Overlay */}

      {/* Notifications Overlay */}
    </header>
  )
}

export default UnifiedHeader
