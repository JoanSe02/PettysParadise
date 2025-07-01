"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { LogOut, ChevronDown, ChevronUp, CheckCircle, Loader2, Mail, X, User, Shield, Clock } from "lucide-react"
import "../stylos/vet/LogoutVet.css"


const LogoutComponent = () => {
  const [expanded, setExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionTime, setSessionTime] = useState("")
  const dropdownRef = useRef(null)

  const userInitials = useMemo(() => {
    if (!userData) return "U"
    const first = userData.nombre?.charAt(0)?.toUpperCase() || ""
    const last = userData.apellido?.charAt(0)?.toUpperCase() || ""
    return first + last || "U"
  }, [userData])

  const fullName = useMemo(() => {
    if (!userData) return "Usuario"
    return `${userData.nombre || ""} ${userData.apellido || ""}`.trim() || "Usuario"
  }, [userData])

  const formatSessionTime = useCallback((loginTime) => {
    if (!loginTime) return "Sesión activa"

    const now = new Date()
    const login = new Date(loginTime)
    const diffMs = now - login
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m activo`
    }
    return `${diffMinutes}m activo`
  }, [])

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
          role: "Veterinario",
          lastLogin: user.lastLogin || new Date().toISOString(),
          avatar: user.avatar || null,
        }

        setUserData(validatedUser)
        setSessionTime(formatSessionTime(validatedUser.lastLogin))
      } catch (err) {
        console.error("Error al cargar datos del usuario:", err)
        setUserData({
          nombre: "Usuario",
          apellido: "",
          email: "usuario@recorvet.com",
          role: "Propietario",
          lastLogin: new Date().toISOString(),
          avatar: null,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [formatSessionTime])

  // Actualizar tiempo de sesión cada minuto
  useEffect(() => {
    if (!userData?.lastLogin) return

    const interval = setInterval(() => {
      setSessionTime(formatSessionTime(userData.lastLogin))
    }, 60000)

    return () => clearInterval(interval)
  }, [userData?.lastLogin, formatSessionTime])

  useEffect(() => {
    if (!expanded) return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setExpanded(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
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
        <div className="loading-text">Cargando...</div>
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
      <div ref={dropdownRef} className="user-dropdown-container1">
        <div
          onClick={toggleExpand}
          className="user-info-container1"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              toggleExpand(e)
            }
          }}
          aria-expanded={expanded}
          aria-haspopup="true"
        >
          <div className="user-initials2">
            {userData.avatar ? (
              <img src={userData.avatar || "/placeholder.svg"} alt={fullName} className="user-avatar-img1" />
            ) : (
              userInitials
            )}
          </div>

          <div className="user-details1">
            <div className="user-name2" title={fullName}>
              {fullName}
            </div>
            <div className="user-role2">{userData.role}</div>
          </div>

          <button className="toggle-button1" aria-label={expanded ? "Ocultar menú" : "Mostrar menú"} tabIndex={-1}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {expanded && (
          <div className="dropdown-content1 header-dropdown1" role="menu">
            <div className="dropdown-header1">
              <div className="header-initials1">
                {userData.avatar ? (
                  <img src={userData.avatar || "/placeholder.svg"} alt={fullName} className="header-avatar-img1" />
                ) : (
                  userInitials
                )}
              </div>
              <div className="header-text1">
                <div className="header-name1" title={fullName}>
                  {fullName}
                </div>
                <div className="header-role2">
                  <Shield size={12} />
                  {userData.role}
                </div>
              </div>
            </div>

            <div className="dropdown-info1">
              <div className="info-item1">
                <Mail size={14} className="info-icon1" />
                <span title={userData.email}>{userData.email}</span>
              </div>
             
            </div>

            <div className="dropdown-divider1"></div>

            <button
              onClick={() => {
                setExpanded(false)
                setShowModal(true)
              }}
              disabled={isLoggingOut}
              className="logout-button1"
              role="menuitem"
            >
              {isLoggingOut ? <Loader2 size={16} className="animate-spin1" /> : <LogOut size={16} />}
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
              <div className="modal-header2">
                <div className="modal-icon2">
                  <LogOut size={24} />
                </div>
                <h3 id="logout-modal-title2">Cerrar sesión</h3>
                <p>¿Estás seguro de que quieres salir de tu cuenta?</p>
              </div>

              <div className="modal-user-info2">
                <div className="modal-initials2">
                  {userData.avatar ? (
                    <img src={userData.avatar || "/placeholder.svg"} alt={fullName} className="modal-avatar-img1" />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="modal-user-details2">
                  <div className="modal-user-name2">{fullName}</div>
                  <div className="modal-user-email2">{userData.email}</div>
                </div>
              </div>

              <div className="modal-footer2">
                <button onClick={handleModalClose} className="cancel-button2" disabled={isLoggingOut} type="button">
                  Cancelar
                </button>
                <button onClick={handleLogout} disabled={isLoggingOut} className="confirm-logout-button2" type="button">
                  {isLoggingOut ? (
                    <>
                      <Loader2 size={16} className="animate-spin1" />
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