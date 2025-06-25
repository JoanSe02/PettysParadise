import React, { useState, useEffect } from "react";
import { FaFileAlt, FaCalendarAlt, FaPaw, FaStethoscope, FaPills, FaSearch, FaFilter, FaDownload } from "react-icons/fa";
import "../stylos/Historial.css";
import Dashbord from "../propietario/Dashbord";
import HeaderSir from "../propietario/HeaderSir";
import jsPDF from "jspdf"; 
import logoUrl from '../img/logo.png'; 
import Swal from "sweetalert2"; 


// Componente para una tarjeta individual de historial
function HistorialCard({ registro, onDownload }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  return (
    <div className="historial-card">
      <div className="card-header">
        <div className="header-content">
          <div className="mascota-info">
            <img
              src={registro.foto || "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"}
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
            </div>
          </div>
          <div className="date-badge">
            <FaCalendarAlt className="date-icon" />
            {formatDate(registro.fecha)}
          </div>
        </div>
      </div>
      <div className="card-content">
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
      </div>
      <div className="card-footer" style={{ justifyContent: 'flex-end' }}>
        <button onClick={() => onDownload(registro)} className="btn-download">
          <FaDownload /> Descargar PDF
        </button>
      </div>
    </div>
  );
}

const HistorialMedicoPage = () => {
  const [historialData, setHistorialData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMascota, setSelectedMascota] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true);
        setError(null);
        const id_usuario = localStorage.getItem('id_usuario');
        if (!id_usuario) throw new Error('ID de usuario no encontrado');

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token de autenticación no encontrado');
        
        const response = await fetch(`http://localhost:5000/api/historial/usuario/${id_usuario}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const result = await response.json();
        
        if (!result.success || !Array.isArray(result.data)) {
          throw new Error('La respuesta del servidor no es válida');
        }

        setHistorialData(result.data);
        setFilteredData(result.data);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        setError(error.message || 'Error al cargar el historial médico');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  useEffect(() => {
    let filtered = historialData;
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tratamiento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nombre_mascota?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedMascota !== "todas") {
      filtered = filtered.filter(item => item.nombre_mascota === selectedMascota);
    }
    setFilteredData(filtered);
  }, [searchTerm, selectedMascota, historialData]);

  const mascotas = Array.from(new Set(historialData.map((item) => item.nombre_mascota)));

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const generarPDF = (historial) => {
    try {
      const doc = new jsPDF();
      let currentY = 20;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.addImage(logoUrl, 'PNG', margin, 15, 35, 35);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Petty's Paradise", pageWidth - margin, 30, { align: 'right' });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Historial Clínico Veterinario", pageWidth - margin, 40, { align: 'right' });
      doc.setLineWidth(0.5);
      doc.line(margin, 55, pageWidth - margin, 55);
      currentY = 70;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Información del Paciente", margin, currentY);
      currentY += 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Nombre de la Mascota: ${historial.nombre_mascota || 'N/A'}`, margin, currentY);
      doc.text(`Propietario: ${historial.nombre_propietario || 'N/A'}`, pageWidth / 2, currentY);
      currentY += 8;
      doc.text(`Especie: ${historial.especie || 'N/A'}`, margin, currentY);
      doc.text(`Raza: ${historial.raza || 'N/A'}`, pageWidth / 2, currentY);
      currentY += 12;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Detalles de la Consulta", margin, currentY);
      doc.setLineWidth(0.2);
      doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
      currentY += 12;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha de la consulta: ${new Date(historial.fecha).toLocaleDateString('es-CO')}`, margin, currentY);
      currentY += 8;
      doc.text(`Peso: ${historial.peso_kg || 'N/A'} kg`, margin, currentY);
      doc.text(`Temperatura: ${historial.temperatura_c || 'N/A'} °C`, pageWidth / 2, currentY);
      currentY += 12;

      doc.setFont("helvetica", "bold");
      doc.text("Motivo de la Consulta:", margin, currentY);
      currentY += 7;
      doc.setFont("helvetica", "normal");
      const motivoLines = doc.splitTextToSize(historial.motivo_consulta || 'No especificado.', pageWidth - margin * 2);
      doc.text(motivoLines, margin, currentY);
      currentY += motivoLines.length * 5 + 5;

      doc.setFont("helvetica", "bold");
      doc.text("Descripción / Diagnóstico:", margin, currentY);
      currentY += 7;
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(historial.descripcion || 'No especificado.', pageWidth - margin * 2);
      doc.text(descLines, margin, currentY);
      currentY += descLines.length * 5 + 5;

      doc.setFont("helvetica", "bold");
      doc.text("Tratamiento Aplicado:", margin, currentY);
      currentY += 7;
      doc.setFont("helvetica", "normal");
      const tratLines = doc.splitTextToSize(historial.tratamiento || 'No especificado.', pageWidth - margin * 2);
      doc.text(tratLines, margin, currentY);
      currentY += tratLines.length * 5 + 10;

      doc.setFont("helvetica", "normal");
      doc.text(`Próximo Seguimiento: ${historial.proximo_seguimiento ? new Date(historial.proximo_seguimiento).toLocaleDateString('es-CO') : "No especificado"}`, margin, currentY);
      const costoTexto = `Costo: ${historial.costo_consulta ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(historial.costo_consulta) : "N/A"}`;
      doc.text(costoTexto, pageWidth - margin, currentY, { align: 'right' });

      const yFirma = Math.max(currentY + 40, 250);
      doc.line(pageWidth / 2 - 30, yFirma, pageWidth / 2 + 30, yFirma);
      doc.setFontSize(10);
      doc.text("Veterinario a Cargo", pageWidth / 2, yFirma + 7, { align: 'center' });
      doc.text(historial.nombre_veterinario || 'Dr(a). No especificado', pageWidth / 2, yFirma + 12, { align: 'center' });

      doc.save(`Historial_${historial.nombre_mascota || "Paciente"}_${new Date(historial.fecha).toLocaleDateString('es-CO')}.pdf`);
      Swal.fire({ icon: 'success', title: 'PDF generado', showConfirmButton: false, timer: 1500 });

    } catch (error) {
      console.error("Error al generar PDF:", error);
      Swal.fire({ icon: 'error', title: 'Error al generar el PDF' });
    }
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
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialMedicoPage;