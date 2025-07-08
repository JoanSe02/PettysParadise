"use client"
import { Link, Outlet } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import {
  FaPaw,
  FaCalendarAlt,
  FaFileMedical,
  FaArrowRight,
  FaHeart,
  FaExclamationTriangle,
  FaCalendarCheck,
} from "react-icons/fa"
import { GiSittingDog } from 'react-icons/gi'
import { IoSettingsOutline } from "react-icons/io5"
import "../stylos/Pro/Usu.css"
import InterceptarAtras from "../componentes/InterceptarAtras"
import { Base64 } from "js-base64"

import HeaderSir from "../propietario/HeaderSir.jsx"
import Dashbord from "../propietario/Dashbord.jsx"

const PropietarioDashboard = () => {
  // Estados para datos reales
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    genero: "masculino",
  });
  const [pets, setPets] = useState([]);
  const [citas, setCitas] = useState([]);
  const [historiales, setHistoriales] = useState([]);

  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const API_URL = "http://localhost:5000"; // Asegúrate de que esta URL sea correcta

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };


  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const id_usuario = user.id_usuario;

        if (!token || !id_usuario) {
          throw new Error("No hay información de usuario o token de autenticación");
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // --- 1. Obtener Mascotas ---
        const fetchPets = axios.get(`${API_URL}/api/vermas/mascotas`);

        // --- 2. Obtener Citas ---
        const fetchCitas = axios.get(`${API_URL}/api/citas`).then(response => {
            // Filtrar para obtener solo citas próximas (pendientes o confirmadas)
            return response.data.filter(cita => 
                (cita.est_cit === "PENDIENTE" || cita.est_cit === "CONFIRMADA") && new Date(cita.fech_cit) >= new Date()
            );
        });

        // --- 3. Obtener Historiales ---
        const fetchHistorial = axios.get(`${API_URL}/api/historial/usuario/${id_usuario}`).then(response => {
            return response.data.success ? response.data.data : [];
        });

        // Ejecutar todas las peticiones en paralelo
        const [petsResponse, citasResponse, historialResponse] = await Promise.all([
          fetchPets,
          fetchCitas,
          fetchHistorial,
        ]);

        // Actualizar estados con los datos reales
        setUserData({
          nombre: user.nombre || "",
          apellido: user.apellido || "",
          email: user.email || "",
          genero: user.genero || "masculino",
        });

        setPets(petsResponse.data || []);
        setCitas(citasResponse || []);
        setHistoriales(historialResponse || []);

      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
        setError(error.message || "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    document.title = 'Panel Propietario - Petty\'s Paradise'; // Título para la página de inicio
  });

  const getTitleByGender = () => {
    return userData.genero === "femenino" 
      ? `¡Bienvenida, Sra. ${userData.nombre}!`
      : `¡Bienvenido, Propietario!`;
  };

  // Consejos de salud (pueden seguir siendo estáticos o venir de una API)
  const healthTips = [
    { id: 1, title: "Hidratación en verano", content: "Asegúrate de que tu mascota tenga agua fresca disponible.", icon: "💧" },
    { id: 2, title: "Ejercicio diario", content: "Los paseos regulares son esenciales para su salud.", icon: "🐕" },
    { id: 3, title: "Alimentación balanceada", content: "Consulta con tu veterinario sobre la dieta más adecuada.", icon: "🥗" },
  ];

  if (loading) {
    return (
      <div className="app-layout">
        <HeaderSir onToggleSidebar={toggleSidebar} />
        <Dashbord isOpen={sidebarOpen} />
        
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container6">
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
    );
  }

  return (
    <div className="app-layout">
      <InterceptarAtras />
      <HeaderSir onToggleSidebar={toggleSidebar} />
      <Dashbord isOpen={sidebarOpen} />
      <div className="dashboard-container6">
        <main className="main-content1">
          <div className="content-body1">
            <div className="welcome-section-enhanced1">
              <div className="welcome-content1">
                <h2>{getTitleByGender()}</h2>
                <p>Gestiona la salud y bienestar de tus mascotas desde un solo lugar.</p>
              </div>
              <div className="welcome-decoration1">
                <FaPaw className="paw-icon1" />
              </div>
            </div>

            <div className="stats-grid-enhanced1">
              <div className="stat-card1 primary1">
                <div className="stat-icon1">
                  <FaPaw />
                </div>
                <div className="stat-info1">
                  <h3>Mascotas Registradas</h3>
                  <p className="stat-value1">{pets.length}</p>
                </div>
                <Link to={`/propietario/${Base64.encode("infomas")}`} className="card-link2">
                  Ver detalles <FaArrowRight />
                </Link>
              </div>

              <div className="stat-card1 success1">
                <div className="stat-icon1">
                  <FaCalendarCheck />
                </div>
                <div className="stat-info1">
                  <h3>Próximas Citas</h3>
                  <p className="stat-value1">{citas.length}</p>
                </div>
                <Link to={`/propietario/${Base64.encode("citas")}`} className="card-link2">
                  Ver agenda <FaArrowRight />
                </Link>
              </div>

              <div className="stat-card1 warning1">
                <div className="stat-icon1">
                  <FaFileMedical />
                </div>
                <div className="stat-info1">
                  <h3>Registros Médicos</h3>
                  <p className="stat-value1">{historiales.length}</p>
                </div>
                <Link to={`/propietario/${Base64.encode("historial")}`} className="card-link2">
                  Ver todos <FaArrowRight />
                </Link>
              </div>
            </div>

            <div className="quick-actions-section-enhanced">
              <h3>Acciones rápidas</h3>
              <div className="action-buttons-grid">
                <Link to={`/propietario/${Base64.encode("infomas")}`} className="action-btn primary">
                  <GiSittingDog />
                  <span>Ver Mascotas</span>
                  <small>Ver tus mascotas registradas</small>
                </Link>
                <Link to={`/propietario/${Base64.encode("citas")}`} className="action-btn success">
                  <FaCalendarAlt />
                  <span>Agendar nueva cita</span>
                  <small>Programa una visita veterinaria</small>
                </Link>
                <Link to={`/propietario/${Base64.encode("historial")}`} className="action-btn info">
                  <FaFileMedical />
                  <span>Ver historial médico</span>
                  <small>Consulta el historial completo</small>
                </Link>
                <Link to={`/propietario/${Base64.encode("perfil")}`} className="action-btn warning">
                  <IoSettingsOutline />
                  <span>Administra tu perfil</span>
                  <small>Modifica aquí tus datos</small>
                </Link>
              </div>
            </div>

            <div className="health-tips-section">
              <h3><FaHeart /> Consejos de salud</h3>
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
  );
};

export default PropietarioDashboard;