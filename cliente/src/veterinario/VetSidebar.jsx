"use client"

import { Link, useLocation } from "react-router-dom"
import {
  MdEmail as IconMail,
  MdDashboard as IconDashboard,
  MdPets as IconPets,
  MdCalendarToday as IconCalendar,
  MdAssignment as IconAssignment,
  MdClose as IconClose,
  MdVerifiedUser as IconVerified,
  MdExpandLess as IconExpandLess,
  MdExpandMore as IconExpandMore,
} from "react-icons/md"
import { useState } from "react"
import { Base64 } from "js-base64"

const VetSidebar = ({ dashboardData, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const [gestionExpanded, setGestionExpanded] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleGestion = () => {
    setGestionExpanded(!gestionExpanded)
  }

  // --- INICIO DE MODIFICACIONES ---

  // Se definen las rutas codificadas para usarlas tanto en los enlaces como en la lógica de la clase activa.
  const citasPath = `/veterinario/${Base64.encode("citas")}`
  const pacientesPath = `/veterinario/${Base64.encode("pacientes")}`
  const historialesPath = `/veterinario/${Base64.encode("historiales")}`

  // --- FIN DE MODIFICACIONES ---


  return (
    <>
      {sidebarOpen && <div className="mobile-overlay" onClick={toggleSidebar}></div>}

      <div className={`vet-sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
        <div className="vet-sidebar-header">
          <div className="sidebar-brand">
            <img
              src="https://raw.githubusercontent.com/Vale250910/mascotas_app1/refs/heads/main/img/Logo1.png"
              alt="Petty's Paradise Logo"
              className="sidebar-logo"
            />
            <div className="brand-text">
              <h3>Petty's Paradise</h3>
              <p>Sistema de Gestión</p>
            </div>
          </div>
          <button className="vet-sidebar-close" onClick={toggleSidebar}>
            <IconClose size={24} />
          </button>
        </div>

        <div className="vet-user-profile">
          <div className="user-avatar-container">
            <div className="vet-avatar">
              {dashboardData.nombre?.charAt(0)?.toUpperCase() || "D"}
              {dashboardData.apellido?.charAt(0)?.toUpperCase() || "R"}
            </div>
          </div>
          <div className="user-info">
            <h4 className="user-name1">
              Dr. {dashboardData.nombre} {dashboardData.apellido}
            </h4>
            <div className="user-email">
              <IconMail size={14} />
              <span>{dashboardData.email}</span>
            </div>
            <div className="user-role-badge">
              <IconVerified size={12} />
              VETERINARIO
            </div>
          </div>
        </div>

        <nav className="vet-navigation">
          <ul className="nav-list">
            <li className={`nav-item ${location.pathname === "/veterinario" ? "active" : ""}`}>
              <Link to="/veterinario" onClick={() => setSidebarOpen(false)} className="nav-link">
                <IconDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            </li>
          </ul>

          <div className="nav-section">
            <div className="section-header" onClick={toggleGestion}>
              <span className="section-title1">Gestión</span>
              {gestionExpanded ? <IconExpandLess size={20} /> : <IconExpandMore size={20} />}
            </div>

            {gestionExpanded && (
              <ul className="nav-list section-list">
                {/* --- INICIO DE MODIFICACIONES --- */}
                <li className={`nav-item ${location.pathname === citasPath ? "active" : ""}`}>
                  <Link to={citasPath} onClick={() => setSidebarOpen(false)} className="nav-link">
                    <IconCalendar size={20} />
                    <span>Citas</span>
                  </Link>
                </li>
                <li className={`nav-item ${location.pathname === pacientesPath ? "active" : ""}`}>
                  <Link to={pacientesPath} onClick={() => setSidebarOpen(false)} className="nav-link">
                    <IconPets size={20} />
                    <span>Pacientes</span>
                  </Link>
                </li>
                <li className={`nav-item ${location.pathname === historialesPath ? "active" : ""}`}>
                  <Link to={historialesPath} onClick={() => setSidebarOpen(false)} className="nav-link">
                    <IconAssignment size={20} />
                    <span>Historiales</span>
                  </Link>
                </li>
                 {/* --- FIN DE MODIFICACIONES --- */}
              </ul>
            )}
          </div>
        </nav>
      </div>
    </>
  )
}

export default VetSidebar


