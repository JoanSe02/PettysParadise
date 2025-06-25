"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Eye,
  Edit,
  PawPrint,
  Calendar,
  Clock,
  Weight,
  Cake,
  Venus,
  Mars,
  X,
  Plus,
} from "lucide-react"
import { FaPaw } from "react-icons/fa";
import HeaderSir from "../propietario/HeaderSir"
import Dashbord from "../propietario/Dashbord"
import axios from "axios"
import "../stylos/InfoMas.css"

const InfoMas = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    email: "",
  })
  const API_URL = "http://localhost:5000"

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const fetchMascotas = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }

      const response = await axios.get(`${API_URL}/api/vermas/mascotas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setMascotas(response.data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setUserData({
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      email: user.email || "",
    })

    fetchMascotas()
  }, [])

  const filteredMascotas = mascotas.filter((mascota) =>
    mascota.nom_mas && searchTerm ? mascota.nom_mas.toLowerCase().includes(searchTerm.toLowerCase()) : true,
  )

  if (loading) {
    return (
      <div className="dashboard-container">
        <HeaderSir onToggleSidebar={toggleSidebar} />
        <Dashbord isOpen={sidebarOpen} />
        <main className="main-content4">
          <header className="content-header">
            <div className="header-title">
              <h1>Mis Mascotas</h1>
              <p>Cargando...</p>
            </div>
          </header>
          <div className="content-body">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando tus mascotas...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <HeaderSir onToggleSidebar={toggleSidebar} />
      <Dashbord isOpen={sidebarOpen} />

      <main className="main-content4">
 
      <header className="content-header">
        <div className="page-header">
          <div className="header-title-container">
            <div className="header-icon">
              <FaPaw className="icon-white" />
            </div>
            <div>
              <h1 className="header-title">Mis Mascotas</h1>
              <p className="header-subtitle">Administra la información de tus compañeros peludos</p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar mascota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

        <div className="content-body">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">
                  <PawPrint size={24} />
                </div>
                <div className="stat-value">{mascotas.length}</div>
              </div>
              <div className="stat-label">Mascotas Registradas</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: "#ec4899" }}>
                  <Venus size={24} />
                </div>
                <div className="stat-value">{mascotas.filter((m) => m.genero === "Hembra").length}</div>
              </div>
              <div className="stat-label">Hembras</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: "#3b82f6" }}>
                  <Mars size={24} />
                </div>
                <div className="stat-value">{mascotas.filter((m) => m.genero === "Macho").length}</div>
              </div>
              <div className="stat-label">Machos</div>
            </div>
          </div>

          {mascotas.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 2rem",
                textAlign: "center",
                background: "white",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "var(--primary)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  color: "white",
                }}
              >
                <PawPrint size={40} />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.75rem" }}>
                ¡Aún no tienes mascotas registradas!
              </h3>
              <p style={{ color: "var(--muted)", marginBottom: "2rem", maxWidth: "400px" }}>
               Comunícate con el veterinario o agenda una consulta para registrar tu mascota.
              </p>
          
            </div>
          ) : (
            <div className="cards-grid">
              {filteredMascotas.map((mascota) => (
                <div key={mascota.id} className="card">
                  <div className="card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          background: `url(${mascota.foto || "/placeholder.svg?height=60&width=60"}) center/cover`,
                          border: "3px solid var(--border)",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            bottom: "-2px",
                            right: "-2px",
                            width: "20px",
                            height: "20px",
                            background: mascota.genero === "Macho" ? "#3b82f6" : "#ec4899",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "0.75rem",
                          }}
                        >
                          {mascota.genero === "Macho" ? <Mars size={12} /> : <Venus size={12} />}
                        </div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                          {mascota.nom_mas || "Sin nombre"}
                        </h3>
                        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                          {mascota.raza || "Raza no especificada"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                      <span
                        style={{
                          background: "var(--background)",
                          padding: "0.375rem 0.75rem",
                          borderRadius: "var(--radius)",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                        }}
                      >
                        <Cake size={12} />
                        {Number.parseFloat(mascota.edad).toString() || "?"} años
                      </span>
                      <span
                        style={{
                          background: "var(--background)",
                          padding: "0.375rem 0.75rem",
                          borderRadius: "var(--radius)",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                        }}
                      >
                        <Weight size={12} />
                        {Number.parseFloat(mascota.peso).toString() || "?"} kg
                      </span>
                    </div>

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
                        <Calendar size={14} />
                        <span>Última visita: {mascota.ultimaVisita || "No registrada"}</span>
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
                        <Clock size={14} />
                        <span>Próxima cita: Por programar</span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem",
                        background: "#d1fae5",
                        borderRadius: "var(--radius)",
                        fontSize: "0.875rem",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          background: "#10b981",
                          borderRadius: "50%",
                        }}
                      ></div>
                      <span style={{ color: "#065f46" }}>Estado de salud: Excelente</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <Link
                      to={`/propietario/mascotas/${mascota.id}`}
                      className="btn-primary"
                      style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                    >
                      <Eye size={14} />
                      Ver Detalles
                    </Link>
                
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default InfoMas








