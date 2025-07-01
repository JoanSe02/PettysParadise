import { useEffect, useMemo, useState,useCallback } from "react"
import { LogOut, Loader2, CheckCircle, X } from "lucide-react"

const InterceptarAtras = () => {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setUserData({
      nombre: user.nombre || "Usuario",
      apellido: user.apellido || "",
      email: user.email || "usuario@recorvet.com",
    })
  }, [])

  const userInitials = useMemo(() => {
    if (!userData) return "U"
    const first = userData.nombre?.charAt(0)?.toUpperCase() || ""
    const last = userData.apellido?.charAt(0)?.toUpperCase() || ""
    return first + last || "U"
  }, [userData])

  const fullName = useMemo(() => {
    if (!userData) return "Usuario"
    return `${userData.nombre || ""} ${userData.apellido || ""}`.trim()
  }, [userData])

  const handleLogout = async () => {
    setIsLoggingOut(true)

    // Simular animación
    await new Promise((res) => setTimeout(res, 1000))

    localStorage.removeItem("user")
    localStorage.removeItem("token")
    sessionStorage.removeItem("authState")

    if (window.axios?.defaults?.headers?.common) {
      delete window.axios.defaults.headers.common["Authorization"]
    }

    setShowModal(false)
    setShowToast(true)

    setTimeout(() => {
      window.location.href = "/"
    }, 1500)
  }

  const handleModalClose = () => {
    setShowModal(false)
    window.history.pushState(null, null, window.location.pathname)
  }

  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault()
      setShowModal(true)
    }

    window.history.pushState(null, null, window.location.pathname)
    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])
  const closeToast = useCallback(() => {
      setShowToast(false)
    }, [])

  return (
    <>
      {showModal && (
        <div className="modal-overlay1" onClick={handleModalClose}>
          <div className="modal-content1" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header1">
              <div className="modal-icon1">
                <LogOut size={24} />
              </div>
              <h3>Cerrar sesión</h3>
              <p>¿Estás seguro de que quieres salir de tu cuenta?</p>
            </div>

            <div className="modal-user-info1">
              <div className="modal-initials1">{userInitials}</div>
              <div className="modal-user-details1">
                <div className="modal-user-name1">{fullName}</div>
                <div className="modal-user-email1">{userData?.email}</div>
              </div>
            </div>

            <div className="modal-footer1">
              <button onClick={handleModalClose} disabled={isLoggingOut} className="cancel-button1">
                Cancelar
              </button>
              <button onClick={handleLogout} disabled={isLoggingOut} className="confirm-logout-button1">
                {isLoggingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Cerrando sesión...
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Sí, cerrar sesión
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
          <div className="toast-notification3">
            <div className="toast-icon3">
              <CheckCircle size={20} />
            </div>
            <div className="toast-content3">
              <h4>Sesión finalizada</h4>
              <p>Has cerrado sesión correctamente</p>
            </div>
            <button onClick={closeToast} className="toast-close-button3">
              <X size={16} />
            </button>
          </div>
        )}
    </>
  )
}

export default InterceptarAtras

