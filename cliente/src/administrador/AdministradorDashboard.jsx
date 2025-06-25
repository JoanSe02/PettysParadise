"use client"

import { Link, Outlet, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  MdArrowForward as IconArrowRight,
  MdAdd as IconPlus,
  MdPeople as IconPeople,
  MdAssignment as IconAssignment,
  MdSupervisorAccount as IconSupervisor,
} from "react-icons/md"
import axios from "axios"

// Importar componentes separados
import Sidebar from "../administrador/BarAdmin"
import Header from "../administrador/HeaderAdmin"
import "../stylos/Admin/ContentAdmin.css"

const AdministradorDashboard = () => {
  const location = useLocation()
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    totalUsers: 0,
    totalRoles: 3,
    totalServices: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Estado para controlar la visibilidad del sidebar en móvil
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Verificar si estamos en la página principal del dashboard
  const isMainDashboard = location.pathname === "/administrador"

  // Función para alternar la visibilidad del sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // Cargar datos del usuario desde localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        if (user) {
          setUserData((prevState) => ({
            ...prevState,
            nombre: user.nombre || "",
            apellido: user.apellido || "",
            email: user.email || "",
          }))
        }

        // Solo cargar estadísticas si estamos en el dashboard principal
        if (isMainDashboard) {
          const token = localStorage.getItem("token")
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }

          try {
            console.log("🔄 Cargando estadísticas del dashboard administrador...")
            const response = await axios.get("http://localhost:5000/api/roles/dashboard/stats", config)

            if (response.data.success) {
              const stats = response.data.stats
              setUserData((prevState) => ({
                ...prevState,
                totalUsers: stats.totalUsuarios || 0,
                totalServices: stats.totalServicios || 0,
              }))
              console.log("✅ Estadísticas del administrador cargadas:", stats)
            }
          } catch (apiError) {
            console.error("❌ Error al cargar estadísticas del administrador:", apiError)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error("Error al cargar datos del dashboard administrador:", error)
        setError("Error al cargar los datos del administrador")
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [isMainDashboard])

  if (loading && isMainDashboard) {
    return (
      <div className="admin-dashboard1">
        <div className="loading-container1">
          <div className="loading-spinner1"></div>
          <p>Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard1">
      {/* Sidebar Component */}
      <Sidebar 
        userData={userData}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="admin-main-content1">
        {/* Header Component */}
        <Header toggleSidebar={toggleSidebar} />

        <main className="admin-content1">
          {/* Solo mostrar el contenido del dashboard principal si estamos en esa ruta */}
          {isMainDashboard ? (
            <div className="dashboard-summary1">
              <div className="welcome-section1">
                <h2>Bienvenido, {userData.nombre}</h2>
                <p className="welcome-message">
                  Panel de control administrativo de Petty's Paradise. Gestiona usuarios, roles y servicios del sistema.
                </p>
              </div>

              <div className="admin-stats-grid1">
                <div className="admin-stat-card1 users1">
                  <div className="admin-stat-icon1">
                    <IconPeople size={32} />
                  </div>
                  <div className="admin-stat-content1">
                    <h3>Total Usuarios</h3>
                    <p className="admin-stat-value1">{userData.totalUsers}</p>
                    <Link to="/administrador/usuarios" className="card-link">
                      Gestionar usuarios <IconArrowRight />
                    </Link>
                  </div>
                </div>

                <div className="admin-stat-card1 roles1">
                  <div className="admin-stat-icon1">
                    <IconSupervisor size={32} />
                  </div>
                  <div className="admin-stat-content">
                    <h3>Roles del Sistema</h3>
                    <p className="admin-stat-value">{userData.totalRoles}</p>
                    <Link to="/administrador/roles" className="card-link">
                      Gestionar roles <IconArrowRight />
                    </Link>
                  </div>
                </div>

                <div className="admin-stat-card1 services1">
                  <div className="admin-stat-icon1">
                    <IconAssignment size={32} />
                  </div>
                  <div className="admin-stat-content1">
                    <h3>Servicios Disponibles</h3>
                    <p className="admin-stat-value1">{userData.totalServices}</p>
                    <Link to="/administrador/servicios" className="card-link">
                      Gestionar servicios <IconArrowRight />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="quick-actions1">
                <h3>Acciones Administrativas</h3>
                <div className="action-buttons1">
                  <Link to="/administrador/usuarios" className="admin-btn admin-btn-primary1">
                    <IconPlus /> Crear nuevo usuario
                  </Link>
                  <Link to="/administrador/roles" className="admin-btn admin-btn-secondary1">
                    <IconSupervisor /> Gestionar roles
                  </Link>
                  <Link to="/administrador/servicios" className="admin-btn admin-btn-secondar">
                    <IconAssignment /> Registrar servicio
                  </Link>
                </div>
              </div>

              {error && (
                <div className="error-message1">
                  <p>{error}</p>
                </div>
              )}
            </div>
          ) : (
            /* Renderizar las páginas específicas */
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}

export default AdministradorDashboard

