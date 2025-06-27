"use client"

import { MdMenu as IconMenu } from "react-icons/md"
import VetLogout from "./VetLogout"

const VetHeader = ({ toggleSidebar, dashboardData }) => {
  return (
    <header className="vet-header">
      <div className="header-left">
        <button className="vet-menu-toggle" onClick={toggleSidebar}>
          <IconMenu size={24} />
        </button>

        <div className="header-brand">
          <div className="header-brand-icon">
            <span>P</span>
          </div>
          <div className="header-brand-info">
            <h3>Petty's Paradise</h3>
            <p>Sistema de Gestión</p>
          </div>
        </div>
      </div>

      <div className="header-titles">
        <h1 className="header-main-title">Panel Veterinario</h1>
        <p className="header-subtitle">Panel de Control</p>
      </div>

      <div className="header-right">
        <VetLogout />
      </div>
    </header>
  )
}

export default VetHeader


