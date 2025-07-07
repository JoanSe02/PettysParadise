"use client"

import { useState, useEffect } from "react"
import {
  FaUser, FaEnvelope, FaPhone, FaSave, FaEdit, FaMapMarkerAlt, FaCity,
  FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes, FaIdCard, FaCalendarAlt,
  FaShieldAlt, FaUserCircle, FaKey
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
    password: "", // Nueva contraseña
    confirmPassword: "",
    currentPassword: "", // Contraseña actual para verificación
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const id_usuario = localStorage.getItem("id_usuario")

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id_usuario) {
        console.warn("No se encontró id_usuario en localStorage")
        setMessage({ type: "error", text: "No se encontró información de usuario" })
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/perfil/${id_usuario}`)
        if (!res.ok) throw new Error("Error al obtener el perfil del servidor")
        const data = await res.json()
        setUserProfile(data)
        setFormData({
          email: data.email || "",
          telefono: data.telefono || "",
          direccion: data.direccion || "",
          ciudad: data.ciudad || "",
          password: "",
          confirmPassword: "",
          currentPassword: "",
        })
      } catch (error) {
        console.error("Error al cargar el perfil:", error.message)
        setMessage({ type: "error", text: "Error al cargar el perfil." })
      }
    }
    fetchUserProfile()
  }, [id_usuario])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (message.text) setMessage({ type: "", text: "" })
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const validateForm = () => {
    const { email, telefono, direccion, ciudad, password, confirmPassword, currentPassword } = formData;
    if (!email || !telefono || !direccion || !ciudad) {
      setMessage({ type: "error", text: "Los campos de contacto son obligatorios" })
      return false
    }

    if (password) { // Si el usuario está cambiando la contraseña
      if (password.length < 6) {
        setMessage({ type: "error", text: "La nueva contraseña debe tener al menos 6 caracteres" })
        return false
      }
      if (password !== confirmPassword) {
        setMessage({ type: "error", text: "Las nuevas contraseñas no coinciden" })
        return false
      }
    } else { // Si no está cambiando la contraseña, la actual es obligatoria para guardar
      if (!currentPassword) {
        setMessage({ type: "error", text: "Ingresa tu contraseña actual para confirmar los cambios" })
        return false
      }
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
      } else {
        updateData.currentPassword = formData.currentPassword
      }

      const res = await fetch(`http://localhost:5000/api/perfil/actualizar/${userProfile.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setUserProfile((prev) => ({ ...prev, ...updateData }))
      setMessage({ type: "success", text: "Perfil actualizado correctamente" })
      setEditMode(false)
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "", currentPassword: "" }))

    } catch (error) {
      setMessage({ type: "error", text: error.message || "Error al actualizar" })
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
      currentPassword: "",
    })
    setEditMode(false)
    setMessage({ type: "", text: "" })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
  }

  if (!userProfile) {
    return (
      <div className="app-layout5">
        <HeaderSir onToggleSidebar={toggleSidebar} />
        <Dashbord isOpen={sidebarOpen} />
        <div className="main-content5">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando información del perfil...</p>
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
          {/* Header Principal */}
          <div className="page-header">
            <div className="header-title-container">
              <div className="header-icon">
                <FaUserCircle className="icon-white" />
              </div>
              <div className="header-text">
                <h1 className="header-title">Mi Perfil</h1>
                <p className="header-subtitle">
                  Gestiona tu información personal de forma segura y mantén tus datos actualizados
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje de estado */}
          {message.text && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
              <div className="alert-icon">{message.type === "success" ? <FaCheck /> : <FaTimes />}</div>
              <div className="alert-content">
                <span className="alert-text">{message.text}</span>
              </div>
            </div>
          )}

          {/* Card Principal del Perfil */}
          <div className="profile-card">
            {/* Header del Card */}
            <div className="card-header">
              <div className="header-content">
                <div className="header-info">
                  <h2 className="card-title">Información del Propietario</h2>
                  <p className="card-description">
                    Mantén tu información actualizada para recibir el mejor servicio veterinario
                  </p>
                </div>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="edit-button">
                    <FaEdit className="button-icon" />
                    Editar Información
                  </button>
                )}
              </div>
            </div>

            <div className="card-content">
              {loading && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <span className="loading-text">Actualizando información...</span>
                </div>
              )}

              {/* Sección de Identificación del Usuario */}
              <div className="user-identity-section">
                <div className="avatar-container">
                  <div className="avatar">
                    <FaUser className="avatar-icon" />
                  </div>
                  <div className="avatar-badge">
                    <FaShieldAlt />
                  </div>
                </div>
                <div className="user-details">
                  <h3 className="user-name">
                    {userProfile.nombre} {userProfile.apellido}
                  </h3>
                  <div className="user-meta">
                    <div className="meta-item">
                      <FaIdCard className="meta-icon" />
                      <span className="meta-text">
                        {userProfile.tipo_doc} {userProfile.id_usuario}
                      </span>
                    </div>
                    <div className="meta-item">
                      <FaCalendarAlt className="meta-icon" />
                      <span className="meta-text">Miembro desde {formatDate(userProfile.fecha_registro)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Personal No Editable */}
              <div className="info-section">
                <div className="section-header">
                  <div className="section-title">
                    <FaUser className="section-icon" />
                    <span>Información Personal</span>
                  </div>
                  <div className="section-badge">Verificado</div>
                </div>

                <div className="info-grid readonly-grid">
                  <div className="info-field">
                    <label className="field-label">
                      <FaCalendarAlt className="label-icon" />
                      Fecha de Nacimiento
                    </label>
                    <div className="field-value readonly-value">{formatDate(userProfile.fecha_nacimiento)}</div>
                  </div>
                </div>
              </div>

              {/* Información de Contacto Editable */}
              <div className="info-section">
                <div className="section-header">
                  <div className="section-title"><FaEnvelope className="section-icon" /><span>Información de Contacto</span></div>
                  {editMode && <div className="section-badge editing">Editando</div>}
                </div>
                <div className="info-grid">
                  <div className="info-field">
                    <label className="field-label"><FaEnvelope className="label-icon" />Correo Electrónico</label>
                    {editMode ? (<input type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="field-input" />) : (<div className="field-value">{userProfile.email}</div>)}
                  </div>
                  <div className="info-field">
                    <label className="field-label"><FaPhone className="label-icon" />Número de Teléfono</label>
                    {editMode ? (<input type="tel" value={formData.telefono} onChange={(e) => handleInputChange("telefono", e.target.value)} className="field-input" />) : (<div className="field-value">{userProfile.telefono}</div>)}
                  </div>
                  <div className="info-field">
                    <label className="field-label"><FaCity className="label-icon" />Ciudad</label>
                    {editMode ? (<input type="text" value={formData.ciudad} onChange={(e) => handleInputChange("ciudad", e.target.value)} className="field-input" />) : (<div className="field-value">{userProfile.ciudad}</div>)}
                  </div>
                  <div className="info-field full-width">
                    <label className="field-label"><FaMapMarkerAlt className="label-icon" />Dirección Completa</label>
                    {editMode ? (<input type="text" value={formData.direccion} onChange={(e) => handleInputChange("direccion", e.target.value)} className="field-input" />) : (<div className="field-value">{userProfile.direccion}</div>)}
                  </div>
                </div>
              </div>

              {/* Sección de Seguridad */}
              {editMode && (
                <div className="info-section security-section">
                  <div className="section-header">
                    <div className="section-title"><FaLock className="section-icon" /><span>Seguridad de la Cuenta</span></div>
                  </div>
                  <div className="security-notice">
                    <FaShieldAlt className="notice-icon" />
                    <div className="notice-content"><h4>Cambio de Contraseña (Opcional)</h4><p>Solo completa estos campos si deseas cambiar tu contraseña.</p></div>
                  </div>
                  <div className="info-grid">
                    <div className="info-field">
                      <label className="field-label">
                        <FaLock className="label-icon" />
                        Nueva Contraseña
                      </label>
                      <div className="password-container">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="field-input password-input"
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
                    <div className="info-field">
                      <label className="field-label">
                        <FaLock className="label-icon" />
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="password-container">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="field-input password-input"
                          placeholder="Repite la nueva contraseña"
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

                  <div className="security-notice1">
                    <FaKey className="notice-icon" />
                    <div className="notice-content"><h4>Confirmar Cambios</h4><p>Si no estás cambiando tu contraseña, ingresa tu clave actual para guardar los cambios.</p></div>
                  </div>
                  <div className="info-grid">
                    <div className="info-field">
                      <label className="field-label"><FaKey className="label-icon" />Contraseña Actual</label>
                      <div className="password-container">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                          className="field-input password-input"
                          placeholder="Ingresa tu contraseña actual"
                          disabled={!!formData.password}
                        />
                        <button type="button" className="password-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              {editMode && (
                <div className="action-section">
                  <div className="action-buttons">
                    <button onClick={handleSave} disabled={loading} className="save-button primary-button">
                      <FaSave className="button-icon" />
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                    <button onClick={handleCancel} disabled={loading} className="cancel-button secondary-button">
                      <FaTimes className="button-icon" />
                      Cancelar
                    </button>
                  </div>
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
