"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { LogOut, ChevronDown, ChevronUp, CheckCircle, Loader2, Mail, X, User } from "lucide-react"
import "../stylos/Logout.css"

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
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setShowModal(false)
      setShowToast(true)

      localStorage.removeItem("user")
      localStorage.removeItem("token")
      sessionStorage.removeItem("authState")

      if (window.axios?.defaults?.headers?.common) {
        delete window.axios.defaults.headers.common["Authorization"]
      }

      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
    } finally {
      setIsLoggingOut(false)
    }
  }, [])

  const closeToast = useCallback(() => {
    setShowToast(false)
  }, [])

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
      <div ref={dropdownRef} className="user-dropdown-container">
        <div onClick={toggleExpand} className="user-info-container">
          <div className="user-initials1">
            {userInitials}
          </div>

          <div className="user-details">
            <div className="user-name1">
              {fullName}
            </div>
            <div className="user-role1">{userData.role}</div>
          </div>

          <button className="toggle-button" aria-label={expanded ? "Ocultar menú" : "Mostrar menú"}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {expanded && (
          <div className="dropdown-content header-dropdown">
            <div className="dropdown-header">
              <div className="header-initials">
                {userInitials}
              </div>
              <div className="header-text">
                <div className="header-name">
                  {fullName}
                </div>
                <div className="header-role">{userData.role}</div>
              </div>
            </div>

            <div className="dropdown-info">
              <div className="info-item">
                <Mail size={14} className="info-icon" />
                <span>{userData.email}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setExpanded(false)
                setShowModal(true)
              }}
              disabled={isLoggingOut}
              className="logout-button"
            >
              {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              Cerrar sesión
            </button>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => !isLoggingOut && setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-icon">
                  <LogOut size={24} />
                </div>
                <h3>Cerrar sesión</h3>
                <p>¿Estás seguro de que quieres salir de tu cuenta?</p>
              </div>

              <div className="modal-user-info">
                <div className="modal-initials">
                  {userInitials}
                </div>
                <div>
                  <div className="modal-user-name">{fullName}</div>
                  <div className="modal-user-email">{userData.email}</div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="cancel-button" 
                  disabled={isLoggingOut}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="confirm-logout-button"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Cerrando sesión...
                    </>
                  ) : (
                    "Sí, cerrar sesión"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showToast && (
          <div className="toast-notification">
            <div className="toast-icon">
              <CheckCircle size={20} />
            </div>
            <div className="toast-content">
              <h4>Sesión finalizada</h4>
              <p>Has cerrado sesión correctamente</p>
            </div>
            <button onClick={closeToast} className="toast-close-button">
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default LogoutComponent



