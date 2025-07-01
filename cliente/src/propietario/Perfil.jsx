"use client"

import { useState, useEffect } from "react"
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaSave,
  FaEdit,
  FaMapMarkerAlt,
  FaCity,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
} from "react-icons/fa"
import "../stylos/Pro/Perfil.css"
import HeaderSir from "../propietario/HeaderSir"
import Dashbord from "../propietario/Dashbord"

const PerfilUsuarioPage = () => {
  const [userProfile, setUserProfile] = useState(null)
  const [formData, setFormData] = useState({
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    password: "",
    confirmPassword: "",
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const id_usuario = localStorage.getItem("id_usuario")

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("Obteniendo perfil para ID:", id_usuario)

        const res = await fetch(`http://localhost:5000/api/perfil/${id_usuario}`)
        console.log("Respuesta del servidor:", res)

        if (!res.ok) throw new Error("Error al obtener el perfil")

        const data = await res.json()
        console.log("Datos recibidos:", data)

        setUserProfile(data)
        setFormData({
          email: data.email,
          telefono: data.telefono,
          direccion: data.direccion,
          ciudad: data.ciudad,
          password: "",
          confirmPassword: "",
        })
      } catch (error) {
        console.error("Error:", error.message)
        setMessage({ type: "error", text: "Error al cargar el perfil" })
      }
    }

    if (id_usuario) {
      fetchUserProfile()
    } else {
      console.warn("No se encontró id_usuario en localStorage")
      setMessage({ type: "error", text: "No se encontró información de usuario" })
    }
  }, [id_usuario])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (message.text) {
      setMessage({ type: "", text: "" })
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const validateForm = () => {
    if (!formData.email || !formData.telefono || !formData.direccion || !formData.ciudad) {
      setMessage({ type: "error", text: "Todos los campos son obligatorios" })
      return false
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" })
      return false
    }

    if (formData.password && formData.password.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" })
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const updateData = {
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const res = await fetch(`http://localhost:5000/api/perfil/actualizar/${userProfile.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setUserProfile((prev) => ({
        ...prev,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
      }))

      setMessage({ type: "success", text: "Perfil actualizado correctamente" })
      setEditMode(false)
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }))
    } catch (error) {
      setMessage({ type: "error", text: "Error al actualizar: " + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      email: userProfile.email,
      telefono: userProfile.telefono,
      direccion: userProfile.direccion,
      ciudad: userProfile.ciudad,
      password: "",
      confirmPassword: "",
    })
    setEditMode(false)
    setMessage({ type: "", text: "" })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!userProfile) {
    return (
      <div className="app-layout5">
        <HeaderSir onToggleSidebar={toggleSidebar} />
        <Dashbord isOpen={sidebarOpen} />
        <div className="main-content5">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout5">
      <HeaderSir onToggleSidebar={toggleSidebar} />
      <Dashbord isOpen={sidebarOpen} />

      <div className="main-content5">
        <div className="perfil-container">
          {/* Header */}
          <div className="page-header">
            <div className="header-title-container">
              <div className="header-icon">
                <FaUser className="icon-white" />
              </div>
              <div>
                <h1 className="header-title">Mi Perfil</h1>
                <p className="header-subtitle">Gestiona tu información personal de forma segura</p>
              </div>
            </div>
          </div>

          {/* Mensaje de estado */}
          {message.text && (
            <div className={message.type === "success" ? "success-message" : "error-message"}>
              <div className="message-icon">{message.type === "success" ? <FaCheck /> : <FaTimes />}</div>
              <span>{message.text}</span>
            </div>
          )}

          {/* Card principal */}
          <div className="perfil-card">
            <div className="card-header">
              <div className="header-content">
                <div>
                  <h2 className="card-title">Información Personal</h2>
                  <p className="card-description">Mantén tu información actualizada y segura</p>
                </div>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="edit-button">
                    <FaEdit className="button-icon" /> Editar Perfil
                  </button>
                )}
              </div>
            </div>

            <div className="card-content">
              {loading && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                </div>
              )}

              {/* Avatar y nombre */}
              <div className="avatar-section">
                <div className="avatar">
                  <FaUser className="avatar-icon" />
                </div>
                <div className="user-info">
                  <h3 className="user-name">
                    {userProfile.nombre} {userProfile.apellido}
                  </h3>
                  <p className="user-role">
                    {userProfile.tipo_doc} {userProfile.id_usuario}
                  </p>
                </div>
              </div>

              {/* Información no editable */}
              <div className="section">
                <h3 className="section-title">
                  <FaUser className="section-icon" />
                  Información Personal
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label className="info-label">Fecha de Nacimiento</label>
                    <div className="info-value">{formatDate(userProfile.fecha_nacimiento)}</div>
                  </div>
                </div>
              </div>

              {/* Información editable */}
              <div className="section">
                <h3 className="section-title">
                  <FaEdit className="section-icon" />
                  Información de Contacto
                </h3>

                <div className="info-grid">
                  <div className="info-item">
                    <label className="info-label">
                      <FaEnvelope className="label-icon" /> Correo Electrónico
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="edit-input"
                        placeholder="tu@email.com"
                      />
                    ) : (
                      <div className="info-value">{userProfile.email}</div>
                    )}
                  </div>

                  <div className="info-item">
                    <label className="info-label">
                      <FaPhone className="label-icon" /> Teléfono
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange("telefono", e.target.value)}
                        className="edit-input"
                        placeholder="300 123 4567"
                      />
                    ) : (
                      <div className="info-value">{userProfile.telefono}</div>
                    )}
                  </div>

                  <div className="info-item">
                    <label className="info-label">
                      <FaCity className="label-icon" /> Ciudad
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.ciudad}
                        onChange={(e) => handleInputChange("ciudad", e.target.value)}
                        className="edit-input"
                        placeholder="Tu ciudad"
                      />
                    ) : (
                      <div className="info-value">{userProfile.ciudad}</div>
                    )}
                  </div>

                  <div className="info-item-full-width">
                    <label className="info-label">
                      <FaMapMarkerAlt className="label-icon" /> Dirección
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => handleInputChange("direccion", e.target.value)}
                        className="edit-input"
                        placeholder="Calle 123 #45-67"
                      />
                    ) : (
                      <div className="info-value">{userProfile.direccion}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección de contraseña */}
              {editMode && (
                <div className="section">
                  <h3 className="section-title">
                    <FaLock className="section-icon" />
                    Cambiar Contraseña (Opcional)
                  </h3>

                  <div className="info-grid">
                    <div className="info-item">
                      <label className="info-label">
                        <FaLock className="label-icon" /> Nueva Contraseña
                      </label>
                      <div className="password-container">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="password-input"
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="info-item">
                      <label className="info-label">
                        <FaLock className="label-icon" /> Confirmar Contraseña
                      </label>
                      <div className="password-container">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="password-input"
                          placeholder="Repite la contraseña"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              {editMode && (
                <div className="action-buttons">
                  <button onClick={handleSave} disabled={loading} className="save-button">
                    <FaSave className="button-icon" />
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                  <button onClick={handleCancel} disabled={loading} className="cancel-button">
                    <FaTimes className="button-icon" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerfilUsuarioPage




