"use client"

import { Link, useLocation } from "react-router-dom"
import {
  MdEmail as IconMail,
  MdDashboard as IconDashboard,
  MdPeople as IconPeople,
  MdAssignment as IconAssignment,
  MdSupervisorAccount as IconSupervisor,
  MdClose as IconClose,
  MdCalendarMonth as IconCalendar,
  MdSettings as IconSettings,
  MdBarChart as IconAnalytics,
  MdExpandLess as IconExpandLess,
  MdExpandMore as IconExpandMore,
  MdCircle as IconDot,
} from "react-icons/md"
import { useState, useEffect } from "react"
import "../stylos/Admin.css"

const Sidebar = ({ userData, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const [notifications, setNotifications] = useState(3)
  const [expandedSections, setExpandedSections] = useState({
    management: true,
    reports: false,
  })
  const [onlineUsers, setOnlineUsers] = useState(12)

  useEffect(() => {
    // Simular datos en tiempo real
    const interval = setInterval(() => {
      setOnlineUsers(Math.floor(Math.random() * 20) + 5)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const mainNavigationItems = [
    {
      path: "/administrador",
      icon: IconDashboard,
      label: "Dashboard",
      exact: true,
      badge: null,
    },
  ]

  const managementItems = [
    {
      path: "/administrador/usuarios",
      icon: IconPeople,
      label: "Usuarios",
      description: "Gestionar usuarios del sistema",
    },
    {
      path: "/administrador/roles",
      icon: IconSupervisor,
      label: "Roles y Permisos",
      badge: null,
      description: "Configurar roles de usuario",
    },
    {
      path: "/administrador/servicios",
      icon: IconAssignment,
      label: "Servicios",
      badge: null,
      description: "Administrar servicios veterinarios",
    },
    {
      path: "/administrador/citas",
      icon: IconCalendar,
      label: "Citas",
      badge: null,
      description: "Gestionar citas y horarios",
    },
  ]

  const reportsItems = [
    {
      path: "/administrador/analytics",
      icon: IconAnalytics,
      label: "Analíticas",
      badge: null,
      description: "Reportes y estadísticas",
    },
    {
      path: "/administrador/configuracion",
      icon: IconSettings,
      label: "Configuración",
      badge: null,
      description: "Configuración del sistema",
    },
  ]

  const isActiveLink = (item) => {
    if (item.exact) {
      return location.pathname === item.path
    }
    return location.pathname.includes(item.path)
  }

  const userInitials =
    userData?.nombre && userData?.apellido
      ? `${userData.nombre.charAt(0).toUpperCase()}${userData.apellido.charAt(0).toUpperCase()}`
      : "AD"

  const fullName = userData?.nombre && userData?.apellido ? `${userData.nombre} ${userData.apellido}` : "Administrador"

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="mobile-overlay-improved"
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              toggleSidebar()
            }
          }}
          aria-label="Cerrar menú lateral"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar-improved ${sidebarOpen ? "mobile-open" : ""}`}
        role="navigation"
        aria-label="Menú principal de administración"
      >
        {/* Header del Sidebar */}
        <div className="sidebar-header-improved">
          <div className="sidebar-brand">
            <div className="brand-logo-sidebar">
              <img src="https://raw.githubusercontent.com/Vale250910/mascotas_app1/refs/heads/main/img/Logo1.png" alt="VetAdmin Logo" className="logo-dog-sidebar" />
            </div>
            <div className="brand-text">
              <h2>Petty's Paradise</h2>
              
            </div>
          </div>

          <button className="sidebar-close-btn" onClick={toggleSidebar} aria-label="Cerrar menú lateral">
            <IconClose size={20} />
          </button>
        </div>

        {/* Información del Usuario */}
        <div className="user-info-improved">
          <div className="user-avatar-improved">
            {userData?.avatar ? (
              <img src={userData.avatar || "/placeholder.svg"} alt={fullName} className="avatar-image" />
            ) : (
              <span className="avatar-initials">{userInitials}</span>
            )}
            
          </div>

          <div className="user-details-improved">
            <h3 className="user-name-improved" title={fullName}>
              {fullName}
            </h3>
            <div className="user-email-improved" title={userData?.email}>
              <IconMail size={14} />
              <span>{userData?.email || "admin@recorvet.com"}</span>
            </div>
            <div className="user-role-improved">
              <span className="role-badge">ADMINISTRADOR</span>
             
            </div>
          </div>
        </div>

        {/* Sistema de Estadísticas Rápidas */}
        

        {/* Navegación Principal */}
        <nav className="sidebar-nav-improved">
          {/* Dashboard */}
          <div className="nav-section">
            <ul className="nav-list">
              {mainNavigationItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveLink(item)

                return (
                  <li key={item.path} className="nav-item">
                    <Link
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`nav-link-improved ${isActive ? "active" : ""}`}
                      title={item.label}
                    >
                      <div className="nav-link-content">
                        <Icon size={20} className="nav-icon" />
                        <span className="nav-text">{item.label}</span>
                        {item.badge && <span className="nav-badge">{item.badge}</span>}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Sección de Gestión */}
          <div className="nav-section">
            <button
              className="section-header"
              onClick={() => toggleSection("management")}
              aria-expanded={expandedSections.management}
            >
              <span className="section-title">Gestión</span>
              {expandedSections.management ? <IconExpandLess size={18} /> : <IconExpandMore size={18} />}
            </button>

            {expandedSections.management && (
              <ul className="nav-list subsection">
                {managementItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveLink(item)

                  return (
                    <li key={item.path} className="nav-item">
                      <Link
                        to={item.path}
                        onClick={handleLinkClick}
                        className={`nav-link-improved ${isActive ? "active" : ""}`}
                        title={item.description}
                      >
                        <div className="nav-link-content">
                          <Icon size={18} className="nav-icon" />
                          <div className="nav-text-container">
                            <span className="nav-text">{item.label}</span>
                            <span className="nav-description">{item.description}</span>
                          </div>
                          {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Sección de Reportes */}
          <div className="nav-section">
           

            {expandedSections.reports && (
              <ul className="nav-list subsection">
                {reportsItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveLink(item)

                  return (
                    <li key={item.path} className="nav-item">
                      <Link
                        to={item.path}
                        onClick={handleLinkClick}
                        className={`nav-link-improved ${isActive ? "active" : ""}`}
                        title={item.description}
                      >
                        <div className="nav-link-content">
                          <Icon size={18} className="nav-icon" />
                          <div className="nav-text-container">
                            <span className="nav-text">{item.label}</span>
                            <span className="nav-description">{item.description}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </nav>

        {/* Footer del Sidebar */}
        <div className="sidebar-footer-improved">
          
        </div>
      </aside>
    </>
  )
}

export default Sidebar



