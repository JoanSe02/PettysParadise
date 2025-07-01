"use client"

import { FaBars, FaBell } from "react-icons/fa"
import Logout from "../propietario/Logout"
import "../stylos/Pro/Bar.css"

const RecorvetHeader = ({ onToggleSidebar, showSidebarToggle = true }) => {
  return (
    <header className="recorvet-header" style={{
      background: "linear-gradient(135deg,rgb(21, 76, 112) 0%,rgb(14, 142, 221) 100%)",
      padding: "0 1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }}>
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
        <Logout />
      </div>
    </header>
  )
}

export default RecorvetHeader

