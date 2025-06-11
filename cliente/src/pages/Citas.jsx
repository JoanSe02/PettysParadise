"use client"

import { useState, useEffect } from "react"
import { Calendar, Eye, Edit, X, Check, RefreshCw, RotateCcw, Plus, Clock, User, Stethoscope } from "lucide-react"
import { FaCalendarAlt } from "react-icons/fa";
import "../stylos/Citas.css"
import Dashboard from "../propietario/Dashbord"
import { apiService } from "../services/api-service"
import Logout from "../pages/Logout"
import HeaderSir from "../propietario/HeaderSir"
import Dashbord from "../propietario/Dashbord"
export default function GestionCitas() {
  const [showModal, setShowModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCita, setSelectedCita] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState("all")
  const [filtroMascota, setFiltroMascota] = useState("all")
  const [filtroFecha, setFiltroFecha] = useState("")
  const [mascotas, setMascotas] = useState([])
  const [servicios, setServicios] = useState([])
  const [veterinarios, setVeterinarios] = useState([])

  // Obtener datos del usuario
  const userData = JSON.parse(localStorage.getItem("user") || "{}")
  const userId = userData.id_usuario
   const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }


  // Cargar citas al iniciar
  useEffect(() => {
    fetchCitas()
    fetchMascotas()
    fetchServicios()
    fetchVeterinarios()
  }, [])

  // Función para obtener citas
  const fetchCitas = async () => {
    setLoading(true)
    try {
      const data = await apiService.get("/api/citas")

      // Ordenar citas por fecha (más reciente primero)
      const citasOrdenadas = data.sort((a, b) => {
        const fechaA = new Date(a.fech_cit || a.fecha)
        const fechaB = new Date(b.fech_cit || b.fecha)

        if (fechaA > fechaB) return -1
        if (fechaA < fechaB) return 1

        const horaA = a.hora || "00:00"
        const horaB = b.hora || "00:00"

        if (horaA > horaB) return -1
        if (horaA < horaB) return 1

        return 0
      })

      setCitas(citasOrdenadas)
    } catch (err) {
      console.error("Error al cargar citas:", err)
      setError(err.message || "Error al cargar las citas")
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener mascotas del propietario
  const fetchMascotas = async () => {
    try {
      const data = await apiService.get("/api/vermas/mascotas")
      setMascotas(data)
    } catch (err) {
      console.error("Error al cargar mascotas:", err)
    }
  }

  // Función para obtener servicios
  const fetchServicios = async () => {
    try {
      const data = await apiService.get("/api/servicios/servicios")
      setServicios(data)
    } catch (err) {
      console.error("Error al cargar servicios:", err)
    }
  }

  // Función para obtener veterinarios
  const fetchVeterinarios = async () => {
    try {
      const data = await apiService.get("/api/servicios/veterinarios")
      setVeterinarios(data)
    } catch (err) {
      console.error("Error al cargar veterinarios:", err)
    }
  }

  // Función para crear una nueva cita
  const crearCita = async (citaData) => {
    try {
      const backendData = {
        cod_mas: Number.parseInt(citaData.codigo_mascota),
        cod_ser: Number.parseInt(citaData.id_servicio),
        id_vet: Number.parseInt(citaData.id_veterinario),
        fech_cit: citaData.fecha,
        hora: citaData.hora,
        notas: citaData.notas || "",
      }

      await apiService.post("/api/citas", backendData)
      await fetchCitas()
      setShowModal(false)
    } catch (err) {
      console.error("Error al crear cita:", err)
      alert("Error al crear la cita: " + (err.message || "Error desconocido"))
    }
  }

  // Función para actualizar una cita
  const actualizarCita = async (citaData) => {
    try {
      const backendData = {
        cod_mas: Number.parseInt(citaData.codigo_mascota),
        cod_ser: Number.parseInt(citaData.id_servicio),
        id_vet: Number.parseInt(citaData.id_veterinario),
        fech_cit: citaData.fecha,
        hora: citaData.hora,
        estado: citaData.estado,
        notas: citaData.notas || "",
      }

      await apiService.put(`/api/citas/${citaData.codigo}`, backendData)
      await fetchCitas()
      setShowEditModal(false)
    } catch (err) {
      console.error("Error al actualizar cita:", err)
      alert("Error al actualizar la cita: " + (err.message || "Error desconocido"))
    }
  }

  // Función para cancelar una cita
  const cancelarCita = async (codigo) => {
    if (window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
      try {
        await apiService.put(`/api/citas/${codigo}/cancelar`)
        await fetchCitas()
      } catch (err) {
        console.error("Error al cancelar cita:", err)
        alert("Error al cancelar la cita: " + (err.message || "Error desconocido"))
      }
    }
  }

  // Función para reagendar una cita
  const reagendarCita = (cita) => {
    setSelectedCita(cita)
    setShowEditModal(true)
  }

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltroEstado("all")
    setFiltroMascota("all")
    setFiltroFecha("")
  }

  // Filtrar citas según los criterios seleccionados
  const citasFiltradas = citas.filter((cita) => {
    if (filtroEstado !== "all" && cita.estado !== filtroEstado) {
      return false
    }

    if (filtroMascota !== "all" && (cita.cod_mas || cita.codigo_mascota) !== Number.parseInt(filtroMascota)) {
      return false
    }

    if (filtroFecha) {
      const citaFecha = new Date(cita.fech_cit || cita.fecha)
      const filtroFechaObj = new Date(filtroFecha)
      if (citaFecha.toDateString() !== filtroFechaObj.toDateString()) {
        return false
      }
    }

    return true
  })

  return (
    <div className="dashboard-container">
      <HeaderSir onToggleSidebar={toggleSidebar} />
      <Dashbord isOpen={sidebarOpen} />

      {/* Main Content */}
      <main className="main-content3">
        {/* Header */}
       <header className="content-header">
        <div className="page-header">
          <div className="header-title-container">
            <div className="header-icon">
              <FaCalendarAlt className="icon-white" />
            </div>
            <div>
              <h1 className="header-title">Gestión de Citas</h1>
              <p className="header-subtitle">Administra y programa las citas veterinarias de tus mascotas</p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Nueva Cita
          </button>
        </div>
      </header>
        <div className="content-body">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
                <div className="stat-value">{citas.length}</div>
              </div>
              <div className="stat-label">Total de Citas</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: "var(--warning)" }}>
                  <Clock size={24} />
                </div>
                <div className="stat-value">{citas.filter((c) => c.estado === "PENDIENTE").length}</div>
              </div>
              <div className="stat-label">Citas Pendientes</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: "var(--success)" }}>
                  <Check size={24} />
                </div>
                <div className="stat-value">{citas.filter((c) => c.estado === "CONFIRMADA").length}</div>
              </div>
              <div className="stat-label">Citas Confirmadas</div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-container">
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="filter-status">Estado:</label>
                <select
                  id="filter-status"
                  className="filter-select"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="CONFIRMADA">Confirmada</option>
                  <option value="CANCELADA">Cancelada</option>
                  <option value="REALIZADA">Realizada</option>
                  <option value="NO_ASISTIDA">No Asistida</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-pet">Mascota:</label>
                <select
                  id="filter-pet"
                  className="filter-select"
                  value={filtroMascota}
                  onChange={(e) => setFiltroMascota(e.target.value)}
                >
                  <option value="all">Todas las mascotas</option>
                  {mascotas.map((mascota) => (
                    <option key={mascota.cod_mas || mascota.codigo} value={mascota.cod_mas || mascota.codigo}>
                      {mascota.nom_mas || mascota.nombre} ({mascota.raza})
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-date">Fecha:</label>
                <input
                  type="date"
                  id="filter-date"
                  className="filter-input"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>

             <div className="filter-group">
                <button className="btn-clear-filters" onClick={limpiarFiltros}>
                  <RotateCcw size={14} />
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          {/* Citas Grid */}
          <div className="cards-grid">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Cargando citas...</p>
              </div>
            ) : error ? (
              <div className="text-center" style={{ gridColumn: "1 / -1", padding: "2rem", color: "var(--danger)" }}>
                {error}
              </div>
            ) : citasFiltradas.length === 0 ? (
              <div className="text-center" style={{ gridColumn: "1 / -1", padding: "2rem", color: "var(--muted)" }}>
                No hay citas que coincidan con los filtros seleccionados
              </div>
            ) : (
              citasFiltradas.map((cita) => (
                <CitaCard
                  key={cita.cod_cit || cita.codigo}
                  cita={cita}
                  onView={() => {
                    setSelectedCita(cita)
                    setShowViewModal(true)
                  }}
                  onEdit={() => {
                    setSelectedCita(cita)
                    setShowEditModal(true)
                  }}
                  onCancel={() => cancelarCita(cita.cod_cit || cita.codigo)}
                  onReschedule={() => reagendarCita(cita)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modales */}
      {showModal && (
        <NuevaCitaModal
          onClose={() => setShowModal(false)}
          onSubmit={crearCita}
          mascotas={mascotas}
          servicios={servicios}
          veterinarios={veterinarios}
        />
      )}

      {showViewModal && selectedCita && (
        <VerCitaModal
          cita={selectedCita}
          onClose={() => setShowViewModal(false)}
          mascotas={mascotas}
          servicios={servicios}
          veterinarios={veterinarios}
          onReschedule={() => {
            setShowViewModal(false)
            reagendarCita(selectedCita)
          }}
        />
      )}

      {showEditModal && selectedCita && (
        <EditarCitaModal
          cita={selectedCita}
          onClose={() => setShowEditModal(false)}
          onSubmit={actualizarCita}
          mascotas={mascotas}
          servicios={servicios}
          veterinarios={veterinarios}
        />
      )}
    </div>
  )
}

// Componente CitaCard
function CitaCard({ cita, onView, onEdit, onCancel, onReschedule }) {
  const fechaRaw = cita.fech_cit || cita.fecha
  const fecha = fechaRaw ? new Date(fechaRaw) : new Date()
  const fechaValida = !isNaN(fecha.getTime())

  const mes = fechaValida ? fecha.toLocaleString("es", { month: "short" }).toUpperCase() : "---"
  const dia = fechaValida ? fecha.getDate() : "--"
  const año = fechaValida ? fecha.getFullYear() : "----"
  const hora = cita.hora ? cita.hora.substring(0, 5) : "00:00"

  let statusClass = ""
  switch (cita.estado) {
    case "CONFIRMADA":
      statusClass = "confirmed"
      break
    case "PENDIENTE":
      statusClass = "pending"
      break
    case "CANCELADA":
      statusClass = "canceled"
      break
    case "REALIZADA":
      statusClass = "completed"
      break
    case "NO_ASISTIDA":
      statusClass = "canceled"
      break
    default:
      statusClass = "pending"
  }

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
              {mes} {dia}, {año}
            </div>
            <div style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>{hora}</div>
          </div>
          <span className={`status-badge ${statusClass}`}>{cita.estado}</span>
        </div>
      </div>

      <div className="card-body">
        <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.75rem" }}>
          {cita.servicio || "Servicio no especificado"}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: "var(--muted)",
            }}
          >
            <User size={16} />
            <span>{cita.mascota || "Mascota no especificada"}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: "var(--muted)",
            }}
          >
            <Stethoscope size={16} />
            <span>{cita.veterinario || "Veterinario no asignado"}</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <button className="btn-secondary" onClick={onView} style={{ fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}>
          <Eye size={14} />
          Ver
        </button>
        {cita.estado !== "CANCELADA" && cita.estado !== "REALIZADA" && (
          <>
            <button
              className="btn-secondary"
              onClick={onEdit}
              style={{ fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}
            >
              <Edit size={14} />
              Editar
            </button>
            <button
              className="btn-secondary"
              onClick={onReschedule}
              style={{ fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}
            >
              <Calendar size={14} />
              Reagendar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Componente NuevaCitaModal
function NuevaCitaModal({ onClose, onSubmit, mascotas, servicios, veterinarios }) {
  const [formData, setFormData] = useState({
    codigo_mascota: "",
    id_servicio: "",
    id_veterinario: "",
    fecha: "",
    hora: "",
    notas: "",
  })

  const [errors, setErrors] = useState({})

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 1)
  const maxDateStr = maxDate.toISOString().split("T")[0]

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))

    if (id === "fecha") {
      validateDate(value)
    } else if (id === "hora") {
      validateTime(value)
    }
  }

  const validateDate = (date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const oneMonthLater = new Date()
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)
    oneMonthLater.setHours(23, 59, 59, 999)

    if (selectedDate <= today) {
      setErrors((prev) => ({ ...prev, fecha: "La cita debe ser a partir de mañana" }))
      return false
    } else if (selectedDate > oneMonthLater) {
      setErrors((prev) => ({ ...prev, fecha: "La cita no puede ser más de un mes en el futuro" }))
      return false
    } else {
      setErrors((prev) => ({ ...prev, fecha: null }))
      return true
    }
  }

  const validateTime = (time) => {
    if (!time) {
      setErrors((prev) => ({ ...prev, hora: "La hora es requerida" }))
      return false
    }

    const [hours, minutes] = time.split(":").map(Number)

    if (hours < 8 || hours > 19 || (hours === 19 && minutes > 0)) {
      setErrors((prev) => ({ ...prev, hora: "El horario de atención es de 8:00 AM a 7:00 PM" }))
      return false
    } else {
      setErrors((prev) => ({ ...prev, hora: null }))
      return true
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const isDateValid = validateDate(formData.fecha)
    const isTimeValid = validateTime(formData.hora)

    if (isDateValid && isTimeValid) {
      onSubmit(formData)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Nueva Cita</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="codigo_mascota">Mascota:</label>
              <select
                id="codigo_mascota"
                className="form-select"
                value={formData.codigo_mascota}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar mascota</option>
                {mascotas.map((mascota) => (
                  <option key={mascota.cod_mas || mascota.codigo} value={mascota.cod_mas || mascota.codigo}>
                    {mascota.nom_mas || mascota.nombre} ({mascota.raza})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="id_servicio">Servicio:</label>
              <select
                id="id_servicio"
                className="form-select"
                value={formData.id_servicio}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar servicio</option>
                {servicios.map((servicio) => (
                  <option key={servicio.cod_ser || servicio.codigo} value={servicio.cod_ser || servicio.codigo}>
                    {servicio.nom_ser || servicio.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="id_veterinario">Veterinario:</label>
              <select
                id="id_veterinario"
                className="form-select"
                value={formData.id_veterinario}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar veterinario</option>
                {veterinarios.map((vet) => (
                  <option key={vet.id_vet || vet.id_usuario} value={vet.id_vet || vet.id_usuario}>
                    {vet.nombre} {vet.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fecha">Fecha:</label>
                <input
                  type="date"
                  id="fecha"
                  className="form-input"
                  value={formData.fecha}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDateStr}
                  required
                />
                {errors.fecha && (
                  <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.fecha}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="hora">Hora:</label>
                <input
                  type="time"
                  id="hora"
                  className="form-input"
                  value={formData.hora}
                  onChange={handleChange}
                  min="08:00"
                  max="19:00"
                  required
                />
                {errors.hora && (
                  <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.hora}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notas">Notas adicionales:</label>
              <textarea id="notas" className="form-textarea" rows={3} value={formData.notas} onChange={handleChange} />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Agendar Cita
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente VerCitaModal
function VerCitaModal({ cita, onClose, mascotas, servicios, veterinarios, onReschedule }) {
  const mascota = mascotas.find((m) => (m.cod_mas || m.codigo) === (cita.cod_mas || cita.codigo_mascota))
  const servicio = servicios.find((s) => (s.cod_ser || s.codigo) === (cita.cod_ser || cita.id_servicio))
  const veterinario = veterinarios.find((v) => (v.id_vet || v.id_usuario) === (cita.id_vet || cita.id_veterinario))

  const fechaRaw = cita.fech_cit || cita.fecha
  const fechaValida = fechaRaw && !isNaN(new Date(fechaRaw).getTime())

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Detalles de la Cita</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.75rem" }}>Información General</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <p>
                  <strong>Estado:</strong>{" "}
                  <span className={`status-badge ${cita.estado.toLowerCase()}`}>{cita.estado}</span>
                </p>
                <p>
                  <strong>Fecha:</strong> {fechaValida ? new Date(fechaRaw).toLocaleDateString() : "Fecha inválida"}
                </p>
                <p>
                  <strong>Hora:</strong> {cita.hora ? cita.hora.substring(0, 5) : "No especificada"}
                </p>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.75rem" }}>Servicio</h3>
              <p>{servicio ? servicio.nom_ser || servicio.nombre : "No especificado"}</p>
              {servicio && servicio.descripcion && (
                <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{servicio.descripcion}</p>
              )}
              {servicio && servicio.precio && (
                <p>
                  <strong>Precio:</strong> ${Number.parseFloat(servicio.precio).toString()}
                </p>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.75rem" }}>Mascota</h3>
              <p>{mascota ? `${mascota.nom_mas || mascota.nombre} (${mascota.raza})` : "No especificada"}</p>
              {mascota && (
                <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                  <p>
                    <strong>Especie:</strong> {mascota.especie}
                  </p>
                  <p>
                    <strong>Edad:</strong> {Number.parseFloat(mascota.edad).toString()} años
                  </p>
                  <p>
                    <strong>Peso:</strong> {Number.parseFloat(mascota.peso).toString()} kg
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.75rem" }}>Veterinario</h3>
              <p>{veterinario ? `Dr. ${veterinario.nombre} ${veterinario.apellido}` : "No asignado"}</p>
              {veterinario && veterinario.especialidad && (
                <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                  <strong>Especialidad:</strong> {veterinario.especialidad}
                </p>
              )}
            </div>

            {cita.notas && (
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.75rem" }}>Notas</h3>
                <p>{cita.notas}</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {cita.estado !== "CANCELADA" && cita.estado !== "REALIZADA" && (
            <button className="btn-secondary" onClick={onReschedule}>
              <Calendar size={16} />
              Reagendar
            </button>
          )}
          <button className="btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente EditarCitaModal
function EditarCitaModal({ cita, onClose, onSubmit, mascotas, servicios, veterinarios }) {
  const [formData, setFormData] = useState({
    codigo: cita.cod_cit || cita.codigo,
    codigo_mascota: cita.cod_mas || cita.codigo_mascota || "",
    id_servicio: cita.cod_ser || cita.id_servicio || "",
    id_veterinario: cita.id_vet || cita.id_veterinario || "",
    fecha: cita.fech_cit || cita.fecha ? new Date(cita.fech_cit || cita.fecha).toISOString().split("T")[0] : "",
    hora: cita.hora || "",
    estado: cita.estado || "PENDIENTE",
    notas: cita.notas || "",
    id_usuario: cita.id_pro || cita.id_usuario,
  })

  const [errors, setErrors] = useState({})

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 1)
  const maxDateStr = maxDate.toISOString().split("T")[0]

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))

    if (id === "fecha") {
      validateDate(value)
    } else if (id === "hora") {
      validateTime(value)
    }
  }

  const validateDate = (date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const oneMonthLater = new Date()
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)
    oneMonthLater.setHours(23, 59, 59, 999)

    if (selectedDate <= today) {
      setErrors((prev) => ({ ...prev, fecha: "La cita debe ser a partir de mañana" }))
      return false
    } else if (selectedDate > oneMonthLater) {
      setErrors((prev) => ({ ...prev, fecha: "La cita no puede ser más de un mes en el futuro" }))
      return false
    } else {
      setErrors((prev) => ({ ...prev, fecha: null }))
      return true
    }
  }

  const validateTime = (time) => {
    if (!time) {
      setErrors((prev) => ({ ...prev, hora: "La hora es requerida" }))
      return false
    }

    const [hours, minutes] = time.split(":").map(Number)

    if (hours < 8 || hours > 19 || (hours === 19 && minutes > 0)) {
      setErrors((prev) => ({ ...prev, hora: "El horario de atención es de 8:00 AM a 7:00 PM" }))
      return false
    } else {
      setErrors((prev) => ({ ...prev, hora: null }))
      return true
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const isDateValid = validateDate(formData.fecha)
    const isTimeValid = validateTime(formData.hora)

    if (isDateValid && isTimeValid) {
      onSubmit(formData)
    }
  }

  const confirmarCita = () => {
    setFormData((prev) => ({
      ...prev,
      estado: "CONFIRMADA",
    }))
  }

  const cancelarCita = () => {
    setFormData((prev) => ({
      ...prev,
      estado: "CANCELADA",
    }))
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Cita</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              background: "var(--background)",
              borderRadius: "var(--radius)",
            }}
          >
            <p style={{ marginBottom: "0.75rem" }}>
              Estado actual: <span className={`status-badge ${formData.estado.toLowerCase()}`}>{formData.estado}</span>
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className={`btn-secondary ${formData.estado === "CONFIRMADA" ? "btn-primary" : ""}`}
                onClick={confirmarCita}
                type="button"
              >
                <Check size={16} /> Confirmar
              </button>
              <button
                className={`btn-secondary ${formData.estado === "CANCELADA" ? "btn-primary" : ""}`}
                onClick={cancelarCita}
                type="button"
                style={{ background: formData.estado === "CANCELADA" ? "var(--danger)" : undefined }}
              >
                <X size={16} /> Cancelar
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="codigo_mascota">Mascota:</label>
              <select
                id="codigo_mascota"
                className="form-select"
                value={formData.codigo_mascota}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar mascota</option>
                {mascotas.map((mascota) => (
                  <option key={mascota.cod_mas || mascota.codigo} value={mascota.cod_mas || mascota.codigo}>
                    {mascota.nom_mas || mascota.nombre} ({mascota.raza})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="id_servicio">Servicio:</label>
              <select
                id="id_servicio"
                className="form-select"
                value={formData.id_servicio}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar servicio</option>
                {servicios.map((servicio) => (
                  <option key={servicio.cod_ser || servicio.codigo} value={servicio.cod_ser || servicio.codigo}>
                    {servicio.nom_ser || servicio.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="id_veterinario">Veterinario:</label>
              <select
                id="id_veterinario"
                className="form-select"
                value={formData.id_veterinario}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar veterinario</option>
                {veterinarios.map((vet) => (
                  <option key={vet.id_vet || vet.id_usuario} value={vet.id_vet || vet.id_usuario}>
                    {vet.nombre} {vet.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fecha">Fecha:</label>
                <input
                  type="date"
                  id="fecha"
                  className="form-input"
                  value={formData.fecha}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDateStr}
                  required
                />
                {errors.fecha && (
                  <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.fecha}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="hora">Hora:</label>
                <input
                  type="time"
                  id="hora"
                  className="form-input"
                  value={formData.hora}
                  onChange={handleChange}
                  min="08:00"
                  max="19:00"
                  required
                />
                {errors.hora && (
                  <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{errors.hora}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notas">Notas adicionales:</label>
              <textarea id="notas" className="form-textarea" rows={3} value={formData.notas} onChange={handleChange} />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            <RefreshCw size={16} />
            Actualizar Cita
          </button>
        </div>
      </div>
    </div>
  )
}

