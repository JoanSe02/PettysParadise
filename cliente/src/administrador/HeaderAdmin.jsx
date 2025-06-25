"use client"

import {
  MdMenu as IconMenu,
  MdNotifications as IconNotifications,
  MdSearch as IconSearch,
  MdSettings as IconSettings,
  MdHelp as IconHelp,
  MdFullscreen as IconFullscreen,
  MdFullscreenExit as IconFullscreenExit,
} from "react-icons/md"
import { useState, useEffect, useRef } from "react"
import Logout from "../administrador/LogoutAdmin"
import "../stylos/Admin.css"

const Header = ({ toggleSidebar }) => {
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const searchRef = useRef(null)
  const notificationsRef = useRef(null)

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
      {
        id: 3,
        title: "Recordatorio de cita",
        message: "Cita con Luna en 1 hora",
        time: "Hace 30 min",
        read: true,
        type: "reminder",
        priority: "low",
      },
      {
        id: 4,
        title: "Sistema actualizado",
        message: "El sistema se ha actualizado a la versión 2.1.0",
        time: "Hace 2 horas",
        read: true,
        type: "system",
        priority: "low",
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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setShowNotifications(false)
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment":
        return "📅"
      case "user":
        return "👤"
      case "reminder":
        return "⏰"
      case "system":
        return "⚙️"
      default:
        return "📢"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "priority-high"
      case "medium":
        return "priority-medium"
      case "low":
        return "priority-low"
      default:
        return ""
    }
  }

  return (
    <header className="admin-header-improved admin-header-dark-blue" role="banner">
      {/* Left Section */}
      <div className="header-left-section">
        <button
          className="admin-menu-toggle-improved"
          onClick={toggleSidebar}
          aria-label="Abrir menú lateral"
          title="Menú"
        >
          <IconMenu size={22} />
        </button>

        <div className="header-branding">
          <div className="brand-logo">
            
            <div className="brand-info">
              <h1 className="brand-title">Panel de Administrador</h1>
              <span className="brand-subtitle">Panel de Control</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Section */}
      

      {/* Right Section */}
      <div className="header-right-section">
        

        {/* User Menu */}
        <div className="user-menu-section">
          <Logout />
        </div>
      </div>

      {/* Search Overlay */}
      {showSearch && <div className="search-overlay" onClick={() => setShowSearch(false)}></div>}

      {/* Notifications Overlay */}
      {showNotifications && (
        <div className="notifications-overlay-improved" onClick={() => setShowNotifications(false)}></div>
      )}
    </header>
  )
}

export default Header






