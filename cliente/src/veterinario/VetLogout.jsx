"use client"

import { useState } from "react"
import { MdLogout as IconLogout } from "react-icons/md"
import "../stylos/Vet.css"

const VetLogout = () => {
  const [showModal, setShowModal] = useState(false)

  const handleLogoutClick = () => {
    setShowModal(true)
  }

  const handleConfirmLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  const handleCancelLogout = () => {
    setShowModal(false)
  }

  return (
    <>
      <button onClick={handleLogoutClick} className="vet-logout-btn-header">
        <IconLogout size={20} />
        Cerrar Sesión
      </button>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="vet-logout-modal-overlay">
          <div className="vet-logout-modal">
            <h3>Confirmar Cierre de Sesión</h3>
            <p>¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="vet-logout-modal-buttons">
              <button onClick={handleConfirmLogout} className="vet-logout-confirm-btn">
                Sí, cerrar sesión
              </button>
              <button onClick={handleCancelLogout} className="vet-logout-cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VetLogout
