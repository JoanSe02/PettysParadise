"use client"

import { useState, useEffect } from "react"
import { FaUser, FaEnvelope, FaPhone, FaTrash, FaSave, FaEdit, FaExclamationTriangle } from "react-icons/fa"
import "../stylos/Perfil.css"
import Dashbord from "../propietario/Dashbord"
import HeaderSir from "../propietario/HeaderSir"

const PerfilUsuarioPage = () => {
  const [userProfile, setUserProfile] = useState(null)
  const [formData, setFormData] = useState({ email: '', telefono: '' })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const id_usuario = localStorage.getItem("id_usuario")

useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      console.log("Obteniendo perfil para ID:", id_usuario);

      const res = await fetch(`http://localhost:5000/api/perfil/${id_usuario}`);
      console.log("Respuesta del servidor:", res);

      if (!res.ok) throw new Error("Error al obtener el perfil");

      const data = await res.json();
      console.log("Datos recibidos:", data);

      setUserProfile(data);
      setFormData({ email: data.email, telefono: data.telefono });
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  if (id_usuario) {
    fetchUserProfile();
  } else {
    console.warn("No se encontró id_usuario en localStorage");
  }
}, [id_usuario]);


  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:5000/api/perfil/actualizar/${userProfile.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setUserProfile((prev) => ({
        ...prev,
        email: formData.email,
        telefono: formData.telefono,
      }))

      alert("Perfil actualizado correctamente")
      setEditMode(false)
    } catch (error) {
      alert("Error al actualizar: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      email: userProfile.email,
      telefono: userProfile.telefono,
    })
    setEditMode(false)
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:5000/api/perfil/desactivar/${userProfile.id_usuario}`, {
        method: "PATCH",
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      alert("Cuenta desactivada exitosamente")
      // Redirigir o cerrar sesión aquí si es necesario
    } catch (error) {
      alert("Error al desactivar cuenta: " + error.message)
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 👉 Previene errores al renderizar si no se ha cargado userProfile
  if (!userProfile) {
    return (
      <div className="app-layout">
        <HeaderSir onToggleSidebar={toggleSidebar} />
        <Dashbord isOpen={sidebarOpen} />
        <div className="main-content1">
          <p>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <HeaderSir onToggleSidebar={toggleSidebar} />
      <Dashbord isOpen={sidebarOpen} />

      <div className="main-content1">
        <div className="perfil-container">
          <div className="page-header">
            <div className="header-title-container">
              <div className="header-icon">
                <FaUser className="icon-white" />
              </div>
              <div>
                <h1 className="header-title">Mi Perfil</h1>
                <p className="header-subtitle">Gestiona tu información personal</p>
              </div>
            </div>
          </div>

          <div className="perfil-grid">
            <div className="info-section">
              <div className="perfil-card">
                <div className="card-header">
                  <div className="header-content">
                    <div>
                      <h2 className="card-title">Información Personal</h2>
                      <p className="card-description">Actualiza tu correo electrónico y teléfono</p>
                    </div>
                    {!editMode && (
                      <button onClick={() => setEditMode(true)} className="edit-button">
                        <FaEdit className="button-icon" /> Editar
                      </button>
                    )}
                  </div>
                </div>
                <div className="card-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <label className="info-label">Documento</label>
                      <div className="info-value">
                        {userProfile.tipo_doc} {userProfile.id_usuario}
                      </div>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Nombre Completo</label>
                      <div className="info-value">
                        {userProfile.nombre} {userProfile.apellido}
                      </div>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Ciudad</label>
                      <div className="info-value">{userProfile.ciudad}</div>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Fecha de Nacimiento</label>
                      <div className="info-value">{formatDate(userProfile.fecha_nacimiento)}</div>
                    </div>
                  </div>

                  <div className="info-item full-width">
                    <label className="info-label">Dirección</label>
                    <div className="info-value">{userProfile.direccion}</div>
                  </div>

                  <div className="editable-section">
                    <div className="info-item full-width">
                      <label htmlFor="email" className="info-label">
                        <FaEnvelope className="label-icon email-icon" /> Correo Electrónico
                      </label>
                      {editMode ? (
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        <div className="info-value editable">{userProfile.email}</div>
                      )}
                    </div>

                    <div className="info-item full-width">
                      <label htmlFor="telefono" className="info-label">
                        <FaPhone className="label-icon phone-icon" /> Teléfono
                      </label>
                      {editMode ? (
                        <input
                          id="telefono"
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange("telefono", e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        <div className="info-value editable">{userProfile.telefono}</div>
                      )}
                    </div>
                  </div>

                  {editMode && (
                    <div className="action-buttons">
                      <button onClick={handleSave} disabled={loading} className="save-button">
                        <FaSave className="button-icon" />
                        {loading ? "Guardando..." : "Guardar Cambios"}
                      </button>
                      <button onClick={handleCancel} disabled={loading} className="cancel-button">
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <div className="perfil-card">
                <div className="card-content avatar-container">
                  <div className="avatar">
                    <FaUser className="avatar-icon" />
                  </div>
                  <h3 className="user-name">
                    {userProfile.nombre} {userProfile.apellido}
                  </h3>
                  <p className="user-role">Propietario de Mascotas</p>
                </div>
              </div>

             
              
            </div>
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">¿Estás seguro?</h2>
              <button className="modal-close" onClick={() => setShowDeleteDialog(false)}>
                &times;
              </button>
            </div>
            <div className="modal-content">
              <p className="modal-text">
                Esta acción eliminará permanentemente tu cuenta y todos los datos asociados, incluyendo el historial
                médico de tus mascotas. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowDeleteDialog(false)} disabled={loading}>
                Cancelar
              </button>
              <button className="modal-delete" onClick={handleDeleteAccount} disabled={loading}>
                {loading ? "Eliminando..." : "Sí, eliminar cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerfilUsuarioPage


