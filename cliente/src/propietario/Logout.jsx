"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { LogOut, ChevronDown, ChevronUp, CheckCircle, Loader2, Mail, X, User } from "lucide-react"
import "../stylos/Pro/Logout.css"

const LogoutComponent = () => {
  const [expanded, setExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef(null)

  const userInitials = useMemo(() => {
    if (!userData) return "U"
    const first = userData.nombre?.charAt(0)?.toUpperCase() || ""
    const last = userData.apellido?.charAt(0)?.toUpperCase() || ""
    return first + last || "U"
  }, [userData])

  const fullName = useMemo(() => {
    if (!userData) return "Usuario"
    return `${userData.nombre || ''} ${userData.apellido || ''}`.trim() || "Usuario"
  }, [userData])

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        
        const validatedUser = {
          nombre: user.nombre || "Usuario",
          apellido: user.apellido || "",
          email: user.email || "usuario@recorvet.com",
          role: "Propietario",
          lastLogin: user.lastLogin || new Date().toISOString(),
        }
        
        setUserData(validatedUser)
      } catch (err) {
        console.error("Error al cargar datos del usuario:", err)
        setUserData({
          nombre: "Usuario",
          apellido: "",
          email: "usuario@recorvet.com",
          role: "Propietario",
          lastLogin: new Date().toISOString(),
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  useEffect(() => {
    if (!expanded) return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [expanded])

  const toggleExpand = useCallback((e) => {
    e.stopPropagation()
    setExpanded((prev) => !prev)
  }, [])

   const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true)

      // Simular proceso de logout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Limpiar datos de sesión
      const keysToRemove = ["user", "token", "authState", "sessionData"]
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })

      // Limpiar headers de axios si existe
      if (window.axios?.defaults?.headers?.common) {
        delete window.axios.defaults.headers.common["Authorization"]
      }

      setShowModal(false)
      setShowToast(true)

      // Redirigir después del toast
      setTimeout(() => {
        window.location.href = "/"
      }, 2500)
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
      setShowToast(true) // Mostrar toast incluso si hay error
    } finally {
      setIsLoggingOut(false)
    }
  }, [])

  const closeToast = useCallback(() => {
    setShowToast(false)
  }, [])

  const handleModalClose = useCallback(() => {
    if (!isLoggingOut) {
      setShowModal(false)
    }
  }, [isLoggingOut])

  if (isLoading) {
    return (
      <div className="user-loading">
        <div className="initials-skeleton"></div>
        <div>Cargando...</div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="user-default">
        <User size={20} />
        <span>Usuario</span>
      </div>
    )
  }

  return (
    <>
      <div ref={dropdownRef} className="user-dropdown-container3">
        <div onClick={toggleExpand} className="user-info-container3">
          <div className="user-initials3">
            {userInitials}
          </div>

          <div className="user-details3">
            <div className="user-name3">
              {fullName}
            </div>
            <div className="user-role3">{userData.role}</div>
          </div>

          <button className="toggle-button" aria-label={expanded ? "Ocultar menú" : "Mostrar menú"}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {expanded && (
          <div className="dropdown-content3 header-dropdown3">
            <div className="dropdown-header3">
              <div className="header-initials3">
                {userInitials}
              </div>
              <div className="header-text3">
                <div className="header-name3">
                  {fullName}
                </div>
                <div className="header-role3">{userData.role}</div>
              </div>
            </div>

            <div className="dropdown-info3">
              <div className="info-item3">
                <Mail size={14} className="info-icon3" />
                <span>{userData.email}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setExpanded(false)
                setShowModal(true)
              }}
              disabled={isLoggingOut}
              className="logout-button3"
            >
              {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              Cerrar sesión
            </button>
          </div>
        )}

        {showModal && (
          <div
            className="modal-overlay1"
            onClick={handleModalClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <div className="modal-content1" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header1">
                <div className="modal-icon1">
                  <LogOut size={24} />
                </div>
                <h3 id="logout-modal-title1">Cerrar sesión</h3>
                <p>¿Estás seguro de que quieres salir de tu cuenta?</p>
              </div>

              <div className="modal-user-info1">
                <div className="modal-initials2">
                  {userData.avatar ? (
                    <img src={userData.avatar || "/placeholder.svg"} alt={fullName} className="modal-avatar-img" />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="modal-user-details1">
                  <div className="modal-user-name1">{fullName}</div>
                  <div className="modal-user-email1">{userData.email}</div>
                </div>
              </div>

              <div className="modal-footer1">
                <button onClick={handleModalClose} className="cancel-button1" disabled={isLoggingOut} type="button">
                  Cancelar
                </button>
                <button onClick={handleLogout} disabled={isLoggingOut} className="confirm-logout-button1" type="button">
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
      </div>
    </>
  )
}

export default LogoutComponent



