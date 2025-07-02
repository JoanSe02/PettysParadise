"use client"

import { MdMenu as IconMenu, MdHelpOutline as IconHelp } from "react-icons/md"
import { useState, useEffect, useRef } from "react"
import VetLogout from "./VetLogout"

const VetHeader = ({ toggleSidebar, dashboardData }) => {
  const [showHelp, setShowHelp] = useState(false)
  const helpRef = useRef(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setShowHelp(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleHelp = () => {
    setShowHelp(!showHelp)
  }

  return (
    <header className="vet-header">
      <div className="header-left">
        <button className="vet-menu-toggle" onClick={toggleSidebar}>
          <IconMenu size={24} />
        </button>

        <div className="header-brand">
          <div className="header-brand-info">
            <h3>Petty's Paradise</h3>
            <p>Sistema de Gestión</p>
          </div>
        </div>
      </div>

      <div className="header-titles">
        <h1 className="header-main-title1">Panel Veterinario</h1>
        <p className="header-subtitle1">Panel de Control</p>
      </div>

      <div className="header-right">
        <div className="vet-help-container" ref={helpRef}>
          <button className="vet-help-btn" onClick={toggleHelp} aria-label="Ayuda" title="Ayuda">
            <IconHelp size={20} />
          </button>

          {showHelp && (
            <div className="vet-help-dropdown">
              <div className="vet-help-header">
                <h3>Documentación</h3>
              </div>
              <div className="vet-help-list">
                <a
                  href="https://docs.google.com/document/d/12orKLFckyFBqGmvfWIyx2zBzMtIbFn8G/export?format=pdf"
                  download="Manual de Usuario.pdf"
                  className="vet-help-item"
                  onClick={() => setShowHelp(false)}
                >
                  <div className="vet-help-content">
                    <h4>Manual de Usuario</h4>
                    <p>Guía completa para veterinarios</p>
                  </div>
                </a>
                <a
                  href="https://docs.google.com/document/d/1CiOtc5_mVbrfI3X98kcLJPuRE0peE_4IUv72D6COOnQ/export?format=pdf"
                  download="Manual Técnico.pdf"
                  className="vet-help-item"
                  onClick={() => setShowHelp(false)}
                >
                  <div className="vet-help-content">
                    <h4>Manual Técnico</h4>
                    <p>Documentación técnica del sistema</p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
        <VetLogout />
      </div>
    </header>
  )
}

export default VetHeader
