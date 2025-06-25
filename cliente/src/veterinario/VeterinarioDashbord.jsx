"use client"

import { Outlet, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { apiService } from "../services/api-service"
import "../stylos/Vet.css"

// Importar componentes separados
import VetSidebar from "../veterinario/VetSidebar"
import VetHeader from "../veterinario/VetHeader"
import VetContent from "../veterinario/VetContent"

const VeterinarioDashboard = () => {
  const location = useLocation()

  // UNIFICADO: Un solo estado para todos los datos del dashboard
  const [dashboardData, setDashboardData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    especialidad: "",
    citasProgramadas: 0,
    pacientes: 0,
    historialesMedicos: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isMainDashboard = location.pathname === "/veterinario"

  // Función para alternar la visibilidad del sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // useEffect para cargar los datos del dashboard
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
      // Establecemos la información básica del usuario que no cambiará al navegar
      setDashboardData((prevData) => ({
        ...prevData,
        nombre: storedUser.nombre || "Dr.",
        apellido: storedUser.apellido || "Veterinario",
        email: storedUser.email || "email@example.com",
        especialidad: storedUser.especialidad || "Especialidad General",
      }))
    } catch (err) {
      console.error("Error al cargar datos del usuario desde localStorage", err)
      setError("No se pudieron cargar los datos del usuario.")
    }
  }, []) // El array vacío [] asegura que se ejecute solo una vez al montar.

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (isMainDashboard) {
        setLoading(true)
        setError(null)
        try {
          const response = await apiService.get("/api/citas/veterinario/stats")
          if (response.success) {
            setDashboardData((prevData) => ({
              ...prevData,
              ...response.stats,
            }))
          } else {
            throw new Error("No se pudieron cargar las estadísticas.")
          }
        } catch (err) {
          setError(err.message || "Error al cargar las estadísticas.")
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [isMainDashboard])

  if (loading && isMainDashboard) {
    return (
      <div className="vet-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando panel veterinario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="vet-dashboard">
      {/* Sidebar Component */}
      <VetSidebar dashboardData={dashboardData} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="vet-main-content">
        {/* Header Component */}
        <VetHeader toggleSidebar={toggleSidebar} />

        {/* Solo mostrar el contenido del dashboard principal si estamos en esa ruta */}
        {isMainDashboard ? (
          <VetContent dashboardData={dashboardData} error={error} />
        ) : (
          /* Renderizar las páginas específicas usando Outlet */
          <Outlet />
        )}
      </div>
    </div>
  )
}

export default VeterinarioDashboard
