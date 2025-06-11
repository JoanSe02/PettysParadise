import React, { useState, useEffect } from "react";
import { FaFileAlt, FaCalendarAlt, FaPaw, FaStethoscope, FaPills, FaSearch, FaFilter } from "react-icons/fa";
import "../stylos/Historial.css";
import Dashbord from "../propietario/Dashbord";
import HeaderSir from "../propietario/HeaderSir";

const HistorialMedicoPage = () => {
  const [historialData, setHistorialData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMascota, setSelectedMascota] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Obtener datos del historial médico desde la API
  useEffect(() => {
   const fetchHistorial = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Obtener y validar el ID
    const id_usuario = localStorage.getItem('id_usuario');
    if (!id_usuario) {
      throw new Error('No se encontró el ID del usuario en localStorage');
    }


    // Verificar token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }
    
    const response = await fetch(`http://localhost:5000/api/historial/usuario/${id_usuario}`,
       {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Validar estructura de respuesta
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('Estructura de respuesta inválida');
    }

    const transformedData = result.data.map(item => ({
      cod_his: item.cod_his,
      fech_his: item.fech_his,
      descrip_his: item.descrip_his,
      tratamiento: item.tratamiento,
      mascota: {
        cod_mas: item.cod_mas,
        nom_mas: item.nom_mas,
        especie: item.especie,
        raza: item.raza,
        foto: item.foto || "https://placeholder.pics/svg/60"
      }
    }));
    
    setHistorialData(transformedData);
    setFilteredData(transformedData);
  } catch (error) {
    console.error('Error al cargar historial:', error);
    setError(error.message || 'Error al cargar el historial médico');
  } finally {
    setLoading(false);
  }

    };

    fetchHistorial();
  }, []);

  // Filtrar datos
  useEffect(() => {
    let filtered = historialData;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.descrip_his.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tratamiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.mascota.nom_mas.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMascota !== "todas") {
      filtered = filtered.filter((item) => item.mascota.nom_mas === selectedMascota);
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedMascota, historialData]);

  const mascotas = Array.from(new Set(historialData.map((item) => item.mascota.nom_mas)));

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
    );
  }

  return (
    <div className="app-layout">
      <HeaderSir onToggleSidebar={toggleSidebar} />
      <Dashbord isOpen={sidebarOpen} />
      
      <div className="main-content2">
        <div className="historial-container">
          {/* Header de la página */}
          <div className="page-header">
            <div className="header-title-container">
              <div className="header-icon">
                <FaFileAlt className="icon-white" />
              </div>
              <div>
                <h1 className="header-title">Historial Médico</h1>
                <p className="header-subtitle">Consulta el historial médico completo de tus mascotas</p>
              </div>
            </div>

            {/* Filtros */}
            <div className="filter-card">
              <div className="filter-content">
                <div className="filter-row">
                  <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Buscar en historial médico..."
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

          {/* Mensaje de error */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Lista de historial */}
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
                <div key={registro.cod_his} className="historial-card">
                  <div className="card-header">
                    <div className="header-content">
                      <div className="mascota-info">
                        <img
                          src={registro.mascota.foto}
                          alt={registro.mascota.nom_mas}
                          className="mascota-image"
                          onError={(e) => {
                            e.target.src = "https://placeholder.pics/svg/60";
                          }}
                        />
                        <div>
                          <h3 className="mascota-name">
                            <FaPaw className="mascota-icon" />
                            {registro.mascota.nom_mas}
                          </h3>
                          <p className="mascota-breed">
                            {registro.mascota.especie} • {registro.mascota.raza}
                          </p>
                        </div>
                      </div>
                      <div className="date-badge">
                        <FaCalendarAlt className="date-icon" />
                        {formatDate(registro.fech_his)}
                      </div>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="diagnostico-container">
                      <div className="diagnostico-header">
                        <FaStethoscope className="diagnostico-icon" />
                        <h4 className="diagnostico-title">Diagnóstico</h4>
                      </div>
                      <p className="diagnostico-text">{registro.descrip_his}</p>
                    </div>
                    <div className="tratamiento-container">
                      <div className="tratamiento-header">
                        <FaPills className="tratamiento-icon" />
                        <h4 className="tratamiento-title">Tratamiento</h4>
                      </div>
                      <p className="tratamiento-text">{registro.tratamiento}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialMedicoPage;
