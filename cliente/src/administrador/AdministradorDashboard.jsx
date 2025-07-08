"use client"

import { Link, Outlet, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  MdArrowForward as IconArrowRight,
  MdAdd as IconPlus,
  MdPeople as IconPeople,
  MdAssignment as IconAssignment,
  MdSupervisorAccount as IconSupervisor,
  MdTrendingUp as IconTrending,
  MdDashboard as IconDashboard,
  MdNotifications as IconNotifications,
} from "react-icons/md"
import axios from "axios"
import { Base64 } from "js-base64"

// Importar componentes separados
import Sidebar from "../administrador/BarAdmin"
import Header from "../administrador/HeaderAdmin"
import "../stylos/Admin/ContentAdmin.css"
import InterceptarAtras from "../componentes/InterceptarAtras"

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
    document.title = 'Panel Administrador - Petty\'s Paradise'; // Título para la página de inicio
  });

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

 

  return (
    <div className="admin-dashboard">
      {/* Sidebar Component */}
      <InterceptarAtras />
      <Sidebar userData={userData} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="admin-main-content">
        {/* Header Component */}
        <Header toggleSidebar={toggleSidebar} />

        <main className="admin-content">
          {/* Solo mostrar el contenido del dashboard principal si estamos en esa ruta */}
          {isMainDashboard ? (
            <div className="dashboard-summary">
              {/* Hero Section Mejorada */}
              <div className="hero-section1">
                <div className="hero-content1">
                  <div className="hero-text1">
                    <h1>
                      <span className="greeting">¡Bienvenido de vuelta,</span>
                      <span className="name">{userData.nombre}!</span>
                    </h1>
                    <p className="hero-description">
                      Gestiona tu plataforma desde este panel de control. Supervisa usuarios, roles y servicios de
                      manera eficiente.
                    </p>
                    
                  </div>
                  
                </div>
              </div>

              {/* Grid de Estadísticas Mejorado */}
              <div className="stats-section">
                <div className="section-header5">
                  <h2 className="h21">Resumen del Sistema</h2>
                  <p>Estadísticas principales de tu plataforma</p>
                </div>

                <div className="stats-grid">
                  <div className="stat-card users-card">
                    <div className="stat-header">
                      <div className="stat-icon">
                        <IconPeople size={28} />
                      </div>
                     
                    </div>
                    <div className="stat-content">
                      <h3>Total Usuarios</h3>
                      <div className="stat-value">{userData.totalUsers}</div>
                      <p className="stat-description">Usuarios registrados activos</p>
                    </div>
                    <Link to={`/administrador/${Base64.encode("usuarios")}`}  className="stat-action">
                      <span>Gestionar usuarios</span>
                      <IconArrowRight size={16} />
                    </Link>
                  </div>

                  <div className="stat-card roles-card">
                    <div className="stat-header">
                      <div className="stat-icon">
                        <IconSupervisor size={28} />
                      </div>
                      
                    </div>
                    <div className="stat-content">
                      <h3>Roles del Sistema</h3>
                      <div className="stat-value">{userData.totalRoles}</div>
                      <p className="stat-description">Roles de usuario configurados</p>
                    </div>
                    <Link to={`/administrador/${Base64.encode("roles")}`} className="stat-action">
                      <span>Gestionar roles</span>
                      <IconArrowRight size={16} />
                    </Link>
                  </div>

                  <div className="stat-card services-card">
                    <div className="stat-header5">
                      <div className="stat-icon">
                        <IconAssignment size={28} />
                      </div>
                      
                    </div>
                    <div className="stat-content">
                      <h3>Servicios Disponibles</h3>
                      <div className="stat-value">{userData.totalServices}</div>
                      <p className="stat-description">Servicios activos en la plataforma</p>
                    </div>
                    <Link to={`/administrador/${Base64.encode("servicios")}`} className="stat-action">
                      <span>Gestionar servicios</span>
                      <IconArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas Mejoradas */}
              <div className="actions-section">
                <div className="section-header">
                  <h2 className="h21">Acciones Rápidas</h2>
                  <p>Tareas administrativas más comunes</p>
                </div>

                <div className="actions-grid1">
                  <Link to={`/administrador/${Base64.encode("usuarios")}`} className="action-card1 primary1">
                    <div className="action-icon1">
                      <IconPlus size={24} />
                    </div>
                    <div className="action-content1">
                      <h3>Crear Usuario</h3>
                      <p>Agregar nuevo usuario al sistema</p>
                    </div>
                    <div className="action-arrow1">
                      <IconArrowRight size={20} />
                    </div>
                  </Link>

                  <Link to={`/administrador/${Base64.encode("roles")}`} className="action-card1 secondary1">
                    <div className="action-icon1">
                      <IconSupervisor size={24} />
                    </div>
                    <div className="action-content1">
                      <h3>Gestionar Roles</h3>
                      <p>Configurar permisos y roles</p>
                    </div>
                    <div className="action-arrow1">
                      <IconArrowRight size={20} />
                    </div>
                  </Link>

                  <Link to={`/administrador/${Base64.encode("servicios")}`} className="action-card1 tertiary1">
                    <div className="action-icon1">
                      <IconAssignment size={24} />
                    </div>
                    <div className="action-content1">
                      <h3>Nuevo Servicio</h3>
                      <p>Registrar servicio en la plataforma</p>
                    </div>
                    <div className="action-arrow1">
                      <IconArrowRight size={20} />
                    </div>
                  </Link>

                </div>
              </div>

              {/* Notificaciones/Alertas */}
              

              {error && (
                <div className="error-message">
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


