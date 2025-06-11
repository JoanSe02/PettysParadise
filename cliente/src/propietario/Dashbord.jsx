"use client"

import { Link, useLocation } from "react-router-dom"
import { FaHome, FaPaw, FaCalendarAlt, FaFileAlt, FaUsers, FaHeart } from "react-icons/fa"
import { IoSettingsSharp } from "react-icons/io5";
import "../stylos/Bar.css"

const RecorvetSidebar = ({ isOpen }) => {
  const location = useLocation()

  const menuItems = [
    {
      path: "/propietario",
      icon: FaHome,
      label: "Inicio",
      exact: true,
      color: "#3b82f6",
    },
    {
      path: "/propietario/infomas",
      icon: FaPaw,
      label: "Mis Mascotas",
      color: "#10b981",
    },
    {
      path: "/propietario/citas",
      icon: FaCalendarAlt,
      label: "Citas",
      color: "#f59e0b",
    },
    {
      path: "/propietario/historial",
      icon: FaFileAlt,
      label: "Historial",
      color: "#8b5cf6",
    },
       {
      path: "/propietario/perfil",
      icon: IoSettingsSharp,
      label: "Mi perfil",
      color: "#8b5cf6",
    },
  ]

  const isActiveLink = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={`sidebar ${isOpen ? "open" : ""}`}
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        borderRight: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="sidebar-content">
        {/* Header del sidebar */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e2e8f0",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <FaHeart size={20} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                Mi Panel
              </h3>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                Propietario
              </p>
            </div>
          </div>
        </div>

        <ul className="sidebar-menu" style={{ padding: "0 1rem" }}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveLink(item.path, item.exact)

            return (
              <li key={item.path} className="sidebar-menu-item" style={{ marginBottom: "0.5rem" }}>
                <Link
                  to={item.path}
                  className={`sidebar-menu-link ${isActive ? "active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.875rem 1rem",
                    borderRadius: "10px",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    background: isActive ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "transparent",
                    color: isActive ? "white" : "#4b5563",
                    fontWeight: isActive ? "600" : "500",
                    transform: isActive ? "translateX(4px)" : "translateX(0)",
                    boxShadow: isActive ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.background = "#f1f5f9"
                      e.target.style.transform = "translateX(2px)"
                      e.target.style.color = "#1f2937"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.background = "transparent"
                      e.target.style.transform = "translateX(0)"
                      e.target.style.color = "#4b5563"
                    }
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Botón de ayuda mejorado */}
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "1rem",
            right: "1rem",
          }}
        >
          <button
            className="btn-success"
            style={{
              width: "100%",
              fontSize: "0.875rem",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              padding: "0.875rem 1rem",
              borderRadius: "10px",
              color: "white",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)"
              e.target.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)"
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)"
              e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)"
            }}
          >
            <FaUsers />
            ¿Necesitas ayuda?
          </button>
        </div>
      </div>
    </aside>
  )
}

export default RecorvetSidebar






