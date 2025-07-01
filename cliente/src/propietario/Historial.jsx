"use client"

import { useState, useEffect } from "react"
import {
  FaFileAlt,
  FaCalendarAlt,
  FaPaw,
  FaStethoscope,
  FaPills,
  FaSearch,
  FaFilter,
  FaDownload,
  FaThermometerHalf,
  FaWeight,
  FaDollarSign,
  FaUserMd,
  FaClipboardList,
  FaEye,
} from "react-icons/fa"
import "../stylos/Pro/Historial.css"
import Dashbord from "../propietario/Dashbord"
import HeaderSir from "../propietario/HeaderSir"
import jsPDF from "jspdf"
import logoUrl from "../img/logo.png"
import Swal from "sweetalert2"

// Componente para una tarjeta individual de historial
function HistorialCard({ registro, onDownload, onViewDetails }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  return (
    <div className="historial-card">
      {/* Header mejorado con más información */}
      <div className="card-header">
        <div className="header-content">
          <div className="mascota-info">
            <img
              src={
                registro.foto ||
                "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"
              }
              alt={registro.nombre_mascota}
              className="mascota-image"
            />
            <div>
              <h3 className="mascota-name">
                <FaPaw className="mascota-icon" />
                {registro.nombre_mascota}
              </h3>
              <p className="mascota-breed">
                {registro.especie} • {registro.raza}
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "#6b7280" }}>
                {registro.peso_kg && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <FaWeight /> {registro.peso_kg} kg
                  </span>
                )}
                {registro.temperatura_c && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <FaThermometerHalf /> {registro.temperatura_c}°C
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
            <div className="date-badge">
              <FaCalendarAlt className="date-icon" />
              {formatDate(registro.fecha)}
            </div>
            {registro.costo_consulta && (
              <div
                style={{
                  padding: "0.25rem 0.5rem",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "0.375rem",
                  color: "#15803d",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <FaDollarSign />
                {formatCurrency(registro.costo_consulta)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-content">
        {/* Motivo de consulta */}
        {registro.motivo_consulta && (
          <div
            style={{
              background: "#fef3c7",
              padding: "1rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              border: "1px solid #fbbf24",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <FaClipboardList style={{ color: "#d97706" }} />
              <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#92400e", margin: 0 }}>Motivo de Consulta</h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#78350f", margin: 0, lineHeight: "1.4" }}>
              {registro.motivo_consulta}
            </p>
          </div>
        )}

        <div className="diagnostico-container">
          <div className="diagnostico-header">
            <FaStethoscope className="diagnostico-icon" />
            <h4 className="diagnostico-title">Diagnóstico</h4>
          </div>
          <p className="diagnostico-text">{registro.descripcion}</p>
        </div>

        <div className="tratamiento-container">
          <div className="tratamiento-header">
            <FaPills className="tratamiento-icon" />
            <h4 className="tratamiento-title">Tratamiento</h4>
          </div>
          <p className="tratamiento-text">{registro.tratamiento}</p>
        </div>

        {/* Información adicional */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginTop: "1rem",
            padding: "1rem",
            background: "#f8fafc",
            borderRadius: "0.5rem",
          }}
        >
          {registro.nombre_veterinario && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaUserMd style={{ color: "#2563eb" }} />
              <div>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Veterinario</p>
                <p style={{ fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>{registro.nombre_veterinario}</p>
              </div>
            </div>
          )}

          {registro.proximo_seguimiento && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaCalendarAlt style={{ color: "#10b981" }} />
              <div>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Próximo Seguimiento</p>
                <p style={{ fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>
                  {formatDate(registro.proximo_seguimiento)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card-footer" style={{ justifyContent: "space-between" }}>
        <button
          onClick={() => onViewDetails(registro)}
          className="btn-secondary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            border: "1px solid #2563eb",
            background: "white",
            color: "#2563eb",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <FaEye /> Ver Detalles
        </button>
        <button onClick={() => onDownload(registro)} className="btn-download">
          <FaDownload /> Descargar PDF
        </button>
      </div>
    </div>
  )
}

const HistorialMedicoPage = () => {
  const [historialData, setHistorialData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMascota, setSelectedMascota] = useState("todas")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true)
        setError(null)
        const id_usuario = localStorage.getItem("id_usuario")
        if (!id_usuario) throw new Error("ID de usuario no encontrado")

        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token de autenticación no encontrado")

        const response = await fetch(`http://localhost:5000/api/historial/usuario/${id_usuario}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

        const result = await response.json()

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("La respuesta del servidor no es válida")
        }

        setHistorialData(result.data)
        setFilteredData(result.data)
      } catch (error) {
        console.error("Error al cargar historial:", error)
        setError(error.message || "Error al cargar el historial médico")
      } finally {
        setLoading(false)
      }
    }

    fetchHistorial()
  }, [])

  useEffect(() => {
    let filtered = historialData
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tratamiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nombre_mascota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.motivo_consulta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nombre_veterinario?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (selectedMascota !== "todas") {
      filtered = filtered.filter((item) => item.nombre_mascota === selectedMascota)
    }
    setFilteredData(filtered)
  }, [searchTerm, selectedMascota, historialData])

  const mascotas = Array.from(new Set(historialData.map((item) => item.nombre_mascota)))

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleViewDetails = (registro) => {
    setSelectedRecord(registro)
    setShowDetailsModal(true)
  }

  const generarPDF = (historial) => {
    try {
      const doc = new jsPDF()
      let currentY = 20
      const margin = 20
      const pageWidth = doc.internal.pageSize.getWidth()

      doc.addImage(logoUrl, "PNG", margin, 15, 35, 35)
      doc.setFontSize(22)
      doc.setFont("helvetica", "bold")
      doc.text("Petty's Paradise", pageWidth - margin, 30, { align: "right" })
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("Historial Clínico Veterinario", pageWidth - margin, 40, { align: "right" })
      doc.setLineWidth(0.5)
      doc.line(margin, 55, pageWidth - margin, 55)
      currentY = 70

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Información del Paciente", margin, currentY)
      currentY += 10
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text(`Nombre de la Mascota: ${historial.nombre_mascota || "N/A"}`, margin, currentY)
      doc.text(`Propietario: ${historial.nombre_propietario || "N/A"}`, pageWidth / 2, currentY)
      currentY += 8
      doc.text(`Especie: ${historial.especie || "N/A"}`, margin, currentY)
      doc.text(`Raza: ${historial.raza || "N/A"}`, pageWidth / 2, currentY)
      currentY += 12

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Detalles de la Consulta", margin, currentY)
      doc.setLineWidth(0.2)
      doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2)
      currentY += 12
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text(`Fecha de la consulta: ${new Date(historial.fecha).toLocaleDateString("es-CO")}`, margin, currentY)
      currentY += 8
      doc.text(`Peso: ${historial.peso_kg || "N/A"} kg`, margin, currentY)
      doc.text(`Temperatura: ${historial.temperatura_c || "N/A"} °C`, pageWidth / 2, currentY)
      currentY += 12

      doc.setFont("helvetica", "bold")
      doc.text("Motivo de la Consulta:", margin, currentY)
      currentY += 7
      doc.setFont("helvetica", "normal")
      const motivoLines = doc.splitTextToSize(historial.motivo_consulta || "No especificado.", pageWidth - margin * 2)
      doc.text(motivoLines, margin, currentY)
      currentY += motivoLines.length * 5 + 5

      doc.setFont("helvetica", "bold")
      doc.text("Descripción / Diagnóstico:", margin, currentY)
      currentY += 7
      doc.setFont("helvetica", "normal")
      const descLines = doc.splitTextToSize(historial.descripcion || "No especificado.", pageWidth - margin * 2)
      doc.text(descLines, margin, currentY)
      currentY += descLines.length * 5 + 5

      doc.setFont("helvetica", "bold")
      doc.text("Tratamiento Aplicado:", margin, currentY)
      currentY += 7
      doc.setFont("helvetica", "normal")
      const tratLines = doc.splitTextToSize(historial.tratamiento || "No especificado.", pageWidth - margin * 2)
      doc.text(tratLines, margin, currentY)
      currentY += tratLines.length * 5 + 10

      doc.setFont("helvetica", "normal")
      doc.text(
        `Próximo Seguimiento: ${historial.proximo_seguimiento ? new Date(historial.proximo_seguimiento).toLocaleDateString("es-CO") : "No especificado"}`,
        margin,
        currentY,
      )
      const costoTexto = `Costo: ${historial.costo_consulta ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(historial.costo_consulta) : "N/A"}`
      doc.text(costoTexto, pageWidth - margin, currentY, { align: "right" })

      const yFirma = Math.max(currentY + 40, 250)
      doc.line(pageWidth / 2 - 30, yFirma, pageWidth / 2 + 30, yFirma)
      doc.setFontSize(10)
      doc.text("Veterinario a Cargo", pageWidth / 2, yFirma + 7, { align: "center" })
      doc.text(historial.nombre_veterinario || "Dr(a). No especificado", pageWidth / 2, yFirma + 12, {
        align: "center",
      })

      doc.save(
        `Historial_${historial.nombre_mascota || "Paciente"}_${new Date(historial.fecha).toLocaleDateString("es-CO")}.pdf`,
      )
      Swal.fire({ icon: "success", title: "PDF generado", showConfirmButton: false, timer: 1500 })
    } catch (error) {
      console.error("Error al generar PDF:", error)
      Swal.fire({ icon: "error", title: "Error al generar el PDF" })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="app-layout">
        <HeaderSir onToggleSidebar={toggleSidebar} />
        <Dashbord isOpen={sidebarOpen} />
        <div className="main-content2">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando historial médico...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <HeaderSir onToggleSidebar={toggleSidebar} />
      <Dashbord isOpen={sidebarOpen} />

      <div className="main-content2">
        <div className="historial-container">
          <div className="page-header">
            <div className="header-title-container">
              <div className="header-icon3">
                <FaFileAlt className="icon-white" />
              </div>
              <div>
                <h1 className="header-title3">Historial Médico</h1>
                <p className="header-subtitle">Consulta el historial médico completo de tus mascotas</p>
              </div>
            </div>
            <div className="filter-card">
              <div className="filter-content">
                <div className="filter-row">
                  <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Buscar en historial..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="select-container">
                    <div className="custom-select">
                      <select
                        value={selectedMascota}
                        onChange={(e) => setSelectedMascota(e.target.value)}
                        className="mascota-select"
                      >
                        <option value="todas">Todas las mascotas</option>
                        {mascotas.map((mascota) => (
                          <option key={mascota} value={mascota}>
                            {mascota}
                          </option>
                        ))}
                      </select>
                      <FaFilter className="select-icon" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="historial-list">
            {filteredData.length === 0 ? (
              <div className="empty-card">
                <div className="empty-content">
                  <FaFileAlt className="empty-icon" />
                  <h3 className="empty-title">No se encontraron registros</h3>
                  <p className="empty-text">No hay registros médicos que coincidan con tu búsqueda.</p>
                </div>
              </div>
            ) : (
              filteredData.map((registro) => (
                <HistorialCard
                  key={registro.cod_his}
                  registro={registro}
                  onDownload={generarPDF}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetailsModal && selectedRecord && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.75rem",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            {/* Header del modal */}
            <div
              style={{
                padding: "1.5rem",
                borderBottom: "1px solid #e5e7eb",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                borderRadius: "0.75rem 0.75rem 0 0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: `url(${selectedRecord.foto || "/placeholder.svg?height=60&width=60"}) center/cover`,
                      border: "3px solid rgba(255, 255, 255, 0.3)",
                    }}
                  />
                  <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "600", margin: 0 }}>
                      Consulta de {selectedRecord.nombre_mascota}
                    </h2>
                    <p style={{ opacity: 0.9, margin: 0 }}>
                      {formatDate(selectedRecord.fecha)} • {selectedRecord.nombre_veterinario}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.5rem",
                    borderRadius: "0.25rem",
                    color: "white",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div style={{ padding: "1.5rem" }}>
              {/* Información de la consulta */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#f8fafc",
                  borderRadius: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaCalendarAlt style={{ color: "#2563eb" }} />
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Fecha</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>
                      {formatDate(selectedRecord.fecha)}
                    </p>
                  </div>
                </div>

                {selectedRecord.peso_kg && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaWeight style={{ color: "#10b981" }} />
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Peso</p>
                      <p style={{ fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>{selectedRecord.peso_kg} kg</p>
                    </div>
                  </div>
                )}

                {selectedRecord.temperatura_c && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaThermometerHalf style={{ color: "#f59e0b" }} />
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Temperatura</p>
                      <p style={{ fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>
                        {selectedRecord.temperatura_c}°C
                      </p>
                    </div>
                  </div>
                )}

                {selectedRecord.costo_consulta && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaDollarSign style={{ color: "#059669" }} />
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Costo</p>
                      <p style={{ fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>
                        {formatCurrency(selectedRecord.costo_consulta)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Motivo de consulta */}
              {selectedRecord.motivo_consulta && (
                <div
                  style={{
                    background: "#fef3c7",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    border: "1px solid #fbbf24",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#92400e",
                    }}
                  >
                    <FaClipboardList />
                    Motivo de Consulta
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#78350f", margin: 0, lineHeight: "1.5" }}>
                    {selectedRecord.motivo_consulta}
                  </p>
                </div>
              )}

              {/* Diagnóstico */}
              <div
                style={{
                  background: "#f0fdf4",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                  border: "1px solid #bbf7d0",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#15803d",
                  }}
                >
                  <FaStethoscope />
                  Diagnóstico
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#166534", margin: 0, lineHeight: "1.5" }}>
                  {selectedRecord.descripcion}
                </p>
              </div>

              {/* Tratamiento */}
              <div
                style={{
                  background: "#f0f4ff",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                  border: "1px solid #dbeafe",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#1d4ed8",
                  }}
                >
                  <FaPills />
                  Tratamiento
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#1e40af", margin: 0, lineHeight: "1.5" }}>
                  {selectedRecord.tratamiento}
                </p>
              </div>

              {/* Próximo seguimiento */}
              {selectedRecord.proximo_seguimiento && (
                <div
                  style={{
                    background: "#fef7ff",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    border: "1px solid #e9d5ff",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#7c3aed",
                    }}
                  >
                    <FaCalendarAlt />
                    Próximo Seguimiento
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#6b21a8", margin: 0 }}>
                    {formatDate(selectedRecord.proximo_seguimiento)}
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#374151",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    generarPDF(selectedRecord)
                    setShowDetailsModal(false)
                  }}
                  className="btn-download"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaDownload />
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistorialMedicoPage
