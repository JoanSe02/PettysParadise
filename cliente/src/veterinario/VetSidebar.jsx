"use client"

import { Link, useLocation } from "react-router-dom"
import {
  MdEmail as IconMail,
  MdDashboard as IconDashboard,
  MdPets as IconPets,
  MdCalendarToday as IconCalendar,
  MdAssignment as IconAssignment,
  MdClose as IconClose,
} from "react-icons/md"
import "../stylos/Vet.css"

const VetSidebar = ({ dashboardData, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <>
      {/* Overlay para móvil cuando el sidebar está abierto */}
      {sidebarOpen && <div className="mobile-overlay" onClick={toggleSidebar}></div>}

      {/* Sidebar con clase condicional para móvil */}
      <div className={`vet-sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
        <div className="vet-sidebar-header">
          {/* Botón para cerrar sidebar en móvil */}
          <button className="vet-sidebar-close" onClick={toggleSidebar}>
            <IconClose size={24} />
          </button>
        </div>

        <div className="vet-user-info">
          <div className="vet-avatar">
            {dashboardData.nombre.charAt(0).toUpperCase()}
            {dashboardData.apellido.charAt(0).toUpperCase()}
          </div>
          <div className="vet-user-details">
            <h3 className="user-name_vet">
              Dr. {dashboardData.nombre} {dashboardData.apellido}
            </h3>
            <p className="vet-user-email">
              <IconMail size={16} /> {dashboardData.email}
            </p>
            <span className="vet-user-role">VETERINARIO</span>
            {dashboardData.especialidad && <p className="vet-user-specialty">{dashboardData.especialidad}</p>}
          </div>
        </div>

        <nav className="vet-nav">
          <ul>
            <li className={location.pathname === "/veterinario" ? "active" : ""}>
              <Link to="/veterinario" onClick={() => setSidebarOpen(false)}>
                <IconDashboard /> Dashboard
              </Link>
            </li>
            <li className={location.pathname.includes("/veterinario/citas") ? "active" : ""}>
              <Link to="/veterinario/citas" onClick={() => setSidebarOpen(false)}>
                <IconCalendar /> Gestión de Citas
              </Link>
            </li>
            <li className={location.pathname.includes("/veterinario/pacientes") ? "active" : ""}>
              <Link to="/veterinario/pacientes" onClick={() => setSidebarOpen(false)}>
                <IconPets /> Mis Pacientes
              </Link>
            </li>
            <li className={location.pathname.includes("/veterinario/historiales") ? "active" : ""}>
              <Link to="/veterinario/historiales" onClick={() => setSidebarOpen(false)}>
                <IconAssignment /> Historiales Médicos
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}

export default VetSidebar
