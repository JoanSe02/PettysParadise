"use client"

import { MdMenu as IconMenu } from "react-icons/md"
import VetLogout from "../veterinario/VetLogout"
import "../stylos/Vet.css"

const VetHeader = ({ toggleSidebar }) => {
  return (
    <header className="vet-header">
      {/* Botón de menú hamburguesa para móvil */}
      <button className="vet-menu-toggle" onClick={toggleSidebar}>
        <IconMenu size={24} />
      </button>

      <h1></h1>
      <div className="header-actions">
        <VetLogout />
      </div>
    </header>
  )
}

export default VetHeader
