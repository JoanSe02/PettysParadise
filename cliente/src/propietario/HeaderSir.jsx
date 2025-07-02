"use client"

import { FaBars, FaQuestionCircle } from "react-icons/fa"
import Logout from "../propietario/Logout"
import "../stylos/Pro/Bar.css"
import { useState, useEffect, useRef } from "react"

const RecorvetHeader = ({ onToggleSidebar, showSidebarToggle = true }) => {
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
    <header
      className="recorvet-header"
      style={{
        background: "linear-gradient(135deg,rgb(21, 76, 112) 0%,rgb(14, 142, 221) 100%)",
        padding: "0 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div className="recorvet-brand">
        {showSidebarToggle && (
          <button
            onClick={onToggleSidebar}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "0.5rem",
              marginRight: "1rem",
            }}
          >
            <FaBars />
          </button>
        )}
        <div className="recorvet-brand-icon">
          <img
            src="https://raw.githubusercontent.com/Vale250910/mascotas_app1/refs/heads/main/img/Logo1.png"
            alt="Petty's Paradise Logo"
            style={{
              width: "32px",
              height: "32px",
              objectFit: "contain",
              borderRadius: "4px",
              filter: "brightness(0) invert(1)",
            }}
          />
        </div>
        <span>Petty's Paradise</span>
      </div>

      <div className="recorvet-actions">
        <div className="help-container" ref={helpRef} style={{ position: "relative", marginRight: "1rem" }}>
          <button
            onClick={toggleHelp}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "50%",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)"
            }}
            aria-label="Ayuda"
            title="Ayuda"
          >
            <FaQuestionCircle size={18} />
          </button>

          {showHelp && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: "0",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                border: "1px solid #e2e8f0",
                minWidth: "280px",
                zIndex: 1001,
                animation: "dropdownSlide 0.2s ease-out",
              }}
            >
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#374151", margin: 0 }}>Documentación</h3>
              </div>
              <div style={{ padding: "8px 0" }}>
                <a
                  href="https://docs.google.com/document/d/12orKLFckyFBqGmvfWIyx2zBzMtIbFn8G/export?format=pdf"
                  download="Manual de Usuario.pdf"
                  style={{
                    display: "block",
                    padding: "16px 20px",
                    textDecoration: "none",
                    color: "#374151",
                    transition: "all 0.2s ease",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                  onClick={() => setShowHelp(false)}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f8fafc"
                    e.target.style.color = "#0e8edd"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent"
                    e.target.style.color = "#374151"
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 4px 0", lineHeight: "1.3" }}>
                      Manual de Usuario
                    </h4>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, lineHeight: "1.4" }}>
                      Guía completa para propietarios
                    </p>
                  </div>
                </a>
                <a
                  href="https://docs.google.com/document/d/1CiOtc5_mVbrfI3X98kcLJPuRE0peE_4IUv72D6COOnQ/export?format=pdf"
                  download="Manual Técnico.pdf"
                  style={{
                    display: "block",
                    padding: "16px 20px",
                    textDecoration: "none",
                    color: "#374151",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => setShowHelp(false)}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f8fafc"
                    e.target.style.color = "#0e8edd"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent"
                    e.target.style.color = "#374151"
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 4px 0", lineHeight: "1.3" }}>
                      Manual Técnico
                    </h4>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, lineHeight: "1.4" }}>
                      Documentación técnica del sistema
                    </p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
        <Logout />
      </div>
    </header>
  )
}

export default RecorvetHeader
