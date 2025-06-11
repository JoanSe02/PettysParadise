"use client"
import { Link, Outlet } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import {
  FaPaw,
  FaCalendarAlt,
  FaBell,
  FaCalendarCheck,
  FaFileMedical,
  FaSyringe,
  FaSearch,
  FaArrowRight,
  FaHeart,
  FaChartLine,
  FaUserMd,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa"
import { GiSittingDog } from 'react-icons/gi'
import { IoSettingsOutline } from "react-icons/io5"
import Logout from "../pages/Logout.jsx"
import "../stylos/Usu.css"

import HeaderSir from "../propietario/HeaderSir.jsx"
import Dashbord from "../propietario/Dashbord.jsx"

const PropietarioDashboard = () => {
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    genero: "masculino",
    petsCount: 0,
    upcomingAppointments: 0,
    remindersCount: 0,
    pets: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [recentActivities, setRecentActivities] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [healthTips, setHealthTips] = useState([])
  const [notifications, setNotifications] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const API_URL = "http://localhost:5000"

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        const user = JSON.parse(localStorage.getItem("user") || "{}")

        if (!token) {
          throw new Error("No hay token de autenticación")
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        const petsResponse = await axios.get(`${API_URL}/api/vermas/mascotas`)
        const petsData = petsResponse.data

        // Simulamos datos adicionales para mejorar el dashboard
        setRecentActivities([
          {
            id: 1,
            type: "cita",
            description: "Vacunación completada para Max",
            date: "2024-01-15",
            status: "completed",
            petName: "Max",
          },
          {
            id: 2,
            type: "recordatorio",
            description: "Próxima desparasitación para Luna",
            date: "2024-01-20",
            status: "pending",
            petName: "Luna",
          },
          {
            id: 3,
            type: "cita",
            description: "Chequeo general programado para Rocky",
            date: "2024-01-25",
            status: "scheduled",
            petName: "Rocky",
          },
        ])

        setUpcomingAppointments([
          {
            id: 1,
            petName: "Max",
            type: "Vacunación",
            date: "2024-01-20",
            time: "10:30 AM",
            veterinarian: "Dr. García",
            clinic: "Clínica Veterinaria Central",
          },
          {
            id: 2,
            petName: "Luna",
            type: "Chequeo General",
            date: "2024-01-22",
            time: "3:15 PM",
            veterinarian: "Dra. Martínez",
            clinic: "Clínica Norte",
          },
        ])

        setHealthTips([
          {
            id: 1,
            title: "Hidratación en verano",
            content: "Asegúrate de que tu mascota tenga agua fresca disponible en todo momento.",
            icon: "💧",
          },
          {
            id: 2,
            title: "Ejercicio diario",
            content: "Los paseos regulares son esenciales para la salud física y mental.",
            icon: "🐕",
          },
          {
            id: 3,
            title: "Alimentación balanceada",
            content: "Consulta con tu veterinario sobre la dieta más adecuada.",
            icon: "🥗",
          },
        ])

        setNotifications([
          {
            id: 1,
            message: "Recordatorio: Cita de Max mañana a las 10:30 AM",
            type: "appointment",
            read: false,
            timestamp: "2024-01-19",
          },
          {
            id: 2,
            message: "Nueva vacuna disponible para gatos",
            type: "info",
            read: false,
            timestamp: "2024-01-18",
          },
        ])

        setUserData({
          nombre: user.nombre || "",
          apellido: user.apellido || "",
          email: user.email || "",
          genero: user.genero || "masculino",
          petsCount: petsData.length || 0,
          upcomingAppointments: 2,
          remindersCount: 3,
          pets: petsData || [],
        })
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError(error.message || "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.length > 0) {
      const results = userData.pets.filter((pet) => 
        pet.nombre.toLowerCase().includes(term.toLowerCase())
      )
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setShowSearchResults(false)
  }

  const getTitleByGender = () => {
    return userData.genero === "femenino" 
      ? "¡Bienvenida, Sra. Propietaria!" 
      : "¡Bienvenido, Sr. Propietario!"
  }

  const getUnreadNotifications = () => {
    return notifications.filter((notification) => !notification.read).length
  }

  if (loading) {
    return (
      <div className="app-layout">
        <HeaderSir onToggleSidebar={toggleSidebar} />
        <Dashbord isOpen={sidebarOpen} />
        <div className="dashboard-container">
          <main className="main-content">
            <div className="loading-spinner">
              <div className="spinner-icon">
                <FaPaw className="spinning" />
              </div>
              <p>Cargando datos...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <HeaderSir onToggleSidebar={toggleSidebar} />
        <Dashbord isOpen={sidebarOpen} />
        <main className="main-content">
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <h3>¡Oops! Algo salió mal</h3>
            <p>Error: {error}</p>
            <p>Por favor, verifica tu conexión o intenta nuevamente más tarde.</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              Intentar de nuevo
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
         <div className="app-layout">
        <HeaderSir onToggleSidebar={toggleSidebar} />
        <Dashbord isOpen={sidebarOpen} />
    <div className="dashboard-container">
    
      <main className="main-content">
        <div className="content-body">
          {/* Sección de bienvenida mejorada */}
          <div className="welcome-section-enhanced">
            <div className="welcome-content">
              <h2>{getTitleByGender()}</h2>
              <p>Gestiona la salud y bienestar de tus mascotas desde un solo lugar.</p>
            </div>
            <div className="welcome-decoration">
              <FaPaw className="paw-icon" />
            </div>
          </div>

          {/* Stats grid mejorado */}
          <div className="stats-grid-enhanced">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FaPaw />
              </div>
              <div className="stat-info">
                <h3>Mascotas Registradas</h3>
                <p className="stat-value">{userData.petsCount}</p>
                <span className="stat-change positive">+1 este mes</span>
              </div>
              <Link to="/propietario/infomas" className="card-link">
                Ver detalles <FaArrowRight />
              </Link>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">
                <FaCalendarCheck />
              </div>
              <div className="stat-info">
                <h3>Próximas Citas</h3>
                <p className="stat-value">{userData.upcomingAppointments}</p>
                <span className="stat-change">Esta semana</span>
              </div>
              <Link to="/propietario/citas" className="card-link">
                Ver agenda <FaArrowRight />
              </Link>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <FaBell />
              </div>
              <div className="stat-info">
                <h3>Recordatorios</h3>
                <p className="stat-value">{userData.remindersCount}</p>
                <span className="stat-change">Pendientes</span>
              </div>
              <Link to="/propietario/recordatorios" className="card-link">
                Ver todos <FaArrowRight />
              </Link>
            </div>
          </div>

          {/* Quick actions mejorado */}
          <div className="quick-actions-section-enhanced">
            <h3>Acciones rápidas</h3>
            <div className="action-buttons-grid">
              <Link to="/propietario/infomas" className="action-btn primary">
                <GiSittingDog />
                <span>Ver Mascotas</span>
                <small> Ver tu mascotas registradas</small>
              </Link>
              <Link to="/propietario/citas" className="action-btn success">
                <FaCalendarAlt />
                <span>Agendar nueva cita</span>
                <small>Programa una visita veterinaria</small>
              </Link>
              <Link to="/propietario/historial" className="action-btn info">
                <FaFileMedical />
                <span>Ver historial médico</span>
                <small>Consulta el historial completo</small>
              </Link>
              <Link to="/propietario/perfil" className="action-btn warning">
                <IoSettingsOutline />
                <span>Administra tu perfil</span>
                <small>Modifica aqui tus datos</small>
              </Link>
            </div>
          </div>

          {/* Consejos de salud */}
          <div className="health-tips-section">
            <h3>
              <FaHeart /> Consejos de salud
            </h3>
            <div className="tips-grid">
              {healthTips.map((tip) => (
                <div key={tip.id} className="tip-card">
                  <div className="tip-icon">{tip.icon}</div>
                  <h4>{tip.title}</h4>
                  <p>{tip.content}</p>
                </div>
              ))}
            </div>
          </div>

          <Outlet />
        </div>
      </main>
    </div>
    </div>
  )
}

export default PropietarioDashboard