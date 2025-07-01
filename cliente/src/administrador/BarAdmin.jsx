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
} from "react-icons/md"
import { useState, useEffect } from "react"
import "../stylos/Admin.css"
import { Base64 } from "js-base64"

const UnifiedSidebar = ({ userData, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const [expandedSections, setExpandedSections] = useState({
    management: true,
    reports: false,
  })
  const [onlineUsers, setOnlineUsers] = useState(12)

  useEffect(() => {
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
    },
  ]

  const managementItems = [
    {
      path: `/administrador/${Base64.encode("usuarios")}`,
      icon: IconPeople,
      label: "Usuarios",
      description: "Gestionar usuarios del sistema",
    },
    {
      path: `/administrador/${Base64.encode("roles")}`,
      icon: IconSupervisor,
      label: "Roles y Permisos",
      description: "Configurar roles de usuario",
    },
    {
      path:`/administrador/${Base64.encode("servicios")}`,
      icon: IconAssignment,
      label: "Servicios",
      description: "Administrar servicios veterinarios",
    },
    {
      path: `/administrador/${Base64.encode("citas")}`,
      icon: IconCalendar,
      label: "Citas",
      description: "Gestionar citas y horarios",
    },
  ]

  const reportsItems = [
    {
      path: "/administrador/analytics",
      icon: IconAnalytics,
      label: "Analíticas",
      description: "Reportes y estadísticas",
    },
    {
      path: "/administrador/configuracion",
      icon: IconSettings,
      label: "Configuración",
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
          className="unified-mobile-overlay"
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
        className={`unified-sidebar ${sidebarOpen ? "mobile-open" : ""}`}
        role="navigation"
        aria-label="Menú principal de administración"
      >
        {/* Header del Sidebar */}
        <div className="unified-sidebar-header">
          <div className="unified-sidebar-brand">
            <div className="unified-brand-logo">
              <img
                src="https://raw.githubusercontent.com/Vale250910/mascotas_app1/refs/heads/main/img/Logo1.png"
                alt="VetAdmin Logo"
                className="unified-logo-image"
              />
            </div>
            <div className="unified-brand-text">
              <h2>Petty's Paradise</h2>
              <span>Sistema de Gestión</span>
            </div>
          </div>

          <button className="unified-sidebar-close-btn" onClick={toggleSidebar} aria-label="Cerrar menú lateral">
            <IconClose size={20} />
          </button>
        </div>

        {/* Información del Usuario */}
        <div className="unified-user-info">
          <div className="unified-user-avatar">
            {userData?.avatar ? (
              <img src={userData.avatar || "/placeholder.svg"} alt={fullName} className="unified-avatar-image" />
            ) : (
              <span className="unified-avatar-initials">{userInitials}</span>
            )}
            
          </div>

          <div className="unified-user-details">
            <h3 className="unified-user-name" title={fullName}>
              {fullName}
            </h3>
            <div className="unified-user-email" title={userData?.email}>
              <IconMail size={14} />
              <span>{userData?.email || "admin@pettysparadise.com"}</span>
            </div>
            <div className="unified-user-role">
              <span className="unified-role-badge">ADMINISTRADOR</span>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        

        {/* Navegación Principal */}
        <nav className="unified-sidebar-nav">
          {/* Dashboard */}
          <div className="unified-nav-section">
            <ul className="unified-nav-list">
              {mainNavigationItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveLink(item)

                return (
                  <li key={item.path} className="unified-nav-item">
                    <Link
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`unified-nav-link ${isActive ? "active" : ""}`}
                      title={item.label}
                    >
                      <div className="unified-nav-link-content">
                        <Icon size={20} className="unified-nav-icon" />
                        <span className="unified-nav-text">{item.label}</span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Sección de Gestión */}
          <div className="unified-nav-section">
            <button
              className="unified-section-header"
              onClick={() => toggleSection("management")}
              aria-expanded={expandedSections.management}
            >
              <span className="unified-section-title">Gestión</span>
              {expandedSections.management ? <IconExpandLess size={18} /> : <IconExpandMore size={18} />}
            </button>

            {expandedSections.management && (
              <ul className="unified-nav-list unified-subsection">
                {managementItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveLink(item)

                  return (
                    <li key={item.path} className="unified-nav-item">
                      <Link
                        to={item.path}
                        onClick={handleLinkClick}
                        className={`unified-nav-link ${isActive ? "active" : ""}`}
                        title={item.description}
                      >
                        <div className="unified-nav-link-content">
                          <Icon size={18} className="unified-nav-icon" />
                          <div className="unified-nav-text-container">
                            <span className="unified-nav-text">{item.label}</span>
                            <span className="unified-nav-description">{item.description}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Sección de Reportes */}
          <div className="unified-nav-section">
            
            
            {expandedSections.reports && (
              <ul className="unified-nav-list unified-subsection">
                {reportsItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveLink(item)

                  return (
                    <li key={item.path} className="unified-nav-item">
                      <Link
                        to={item.path}
                        onClick={handleLinkClick}
                        className={`unified-nav-link ${isActive ? "active" : ""}`}
                        title={item.description}
                      >
                        <div className="unified-nav-link-content">
                          <Icon size={18} className="unified-nav-icon" />
                          <div className="unified-nav-text-container">
                            <span className="unified-nav-text">{item.label}</span>
                            <span className="unified-nav-description">{item.description}</span>
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
        <div className="unified-sidebar-footer">
          
        </div>
      </aside>
    </>
  )
}

export default UnifiedSidebar



