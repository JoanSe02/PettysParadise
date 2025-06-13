"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Plus, Search, Edit, Trash2, Stethoscope, User, Dog, Calendar, FileText, X, Download, Thermometer, Weight, FilePlus, History, Clock, UserCheck } from "lucide-react";
import { apiService } from "../../services/api-service";
import jsPDF from "jspdf";
import "../../stylos/vet/HistorialesMedicos.css";
import "../../stylos/vet/loadingvet.css";

// =================================================================================
// COMPONENTE PRINCIPAL
// =================================================================================
export default function HistorialesMedicos() {
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHistorial, setSelectedHistorial] = useState(null);
  
  // Estados para el modal de logs
  const [showLogModal, setShowLogModal] = useState(false);
  const [logData, setLogData] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchHistoriales();
  }, []);

  const showNotification = (message, type = "success") => {
    const icon = type === "success" ? "success" : "error";
    Swal.fire({ icon, title: message, timer: 2500, showConfirmButton: false, toast: true, position: "top-end" });
  };

  const fetchHistoriales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get("/api/historiales");
      setHistoriales(response || []);
    } catch (err) {
      setError("Error al cargar los historiales médicos.");
      showNotification("Error al cargar historiales", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (historialData) => {
    try {
      if (isEditing) {
        await apiService.put(`/api/historiales/${historialData.cod_his}`, historialData);
        showNotification("Historial actualizado exitosamente.");
      } else {
        await apiService.post("/api/historiales", historialData);
        showNotification("Historial registrado exitosamente.");
      }
      closeModal();
      await fetchHistoriales();
    } catch (err) {
      const action = isEditing ? 'actualizar' : 'registrar';
      showNotification(`Error al ${action} el historial: ${err.message}`, "error");
    }
  };

  const handleDelete = async (historialId, mascotaNombre) => {
    const result = await Swal.fire({
      title: `¿Estás seguro de eliminar el registro de ${mascotaNombre}?`,
      text: "Esta acción marcará el registro como eliminado. Podrá ser recuperado por un administrador.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await apiService.delete(`/api/historiales/${historialId}`);
        showNotification("Historial eliminado correctamente.");
        await fetchHistoriales();
      } catch (err) {
        showNotification(`Error al eliminar: ${err.message}`, "error");
      }
    }
  };
  
  const fetchHistorialLog = async (cod_his) => {
    setLoadingLogs(true);
    setShowLogModal(true);
    try {
        const response = await apiService.get(`/api/historiales/${cod_his}/log`);
        if (response.success) {
            setLogData(response.data);
        } else {
            showNotification("No se pudo cargar el historial de cambios.", "error");
        }
    } catch (err) {
        showNotification(`Error: ${err.message}`, "error");
    } finally {
        setLoadingLogs(false);
    }
  };

  const generarPDF = (historial) => {
    try {
      const doc = new jsPDF();
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text("HISTORIAL MÉDICO VETERINARIO", 105, 30, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(127, 140, 141);
      doc.text("Petty's Paradise - Cuidado Profesional", 105, 40, { align: "center" });
      doc.text(`Emitido por: Dr(a). ${historial.nombre_veterinario || `${userData.nombre} ${userData.apellido}`}`, 105, 47, { align: "center" });
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CO')}`, 105, 54, { align: "center" });

      doc.setDrawColor(220, 220, 220);
      doc.line(20, 65, 190, 65);

      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text("INFORMACIÓN DEL PACIENTE", 20, 80);

      doc.setFontSize(11);
      doc.setTextColor(52, 73, 94);
      doc.text(`Nombre: ${historial.nombre_mascota || "N/A"}`, 25, 90);
      doc.text(`Propietario: ${historial.nombre_propietario || "N/A"}`, 25, 97);
      
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text("DETALLES DE LA CONSULTA", 20, 112);

      doc.setFontSize(11);
      doc.setTextColor(52, 73, 94);
      doc.text(`Fecha: ${new Date(historial.fecha).toLocaleDateString('es-CO')}`, 25, 122);
      doc.text(`Peso: ${historial.peso_kg || "N/A"} kg`, 25, 129);
      doc.text(`Temperatura: ${historial.temperatura_c || "N/A"} °C`, 90, 129);
      
      const motivoLines = doc.splitTextToSize(`Motivo de la consulta: ${historial.motivo_consulta || ""}`, 170);
      doc.text(motivoLines, 25, 138);
      let currentY = 138 + (motivoLines.length * 7);

      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text("Descripción / Diagnóstico:", 20, currentY + 10);
      doc.setFontSize(11);
      doc.setTextColor(52, 73, 94);
      const descripcionLines = doc.splitTextToSize(historial.descripcion || "", 170);
      doc.text(descripcionLines, 25, currentY + 17);
      currentY += 17 + (descripcionLines.length * 7);

      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text("Tratamiento Aplicado:", 20, currentY + 10);
      doc.setFontSize(11);
      doc.setTextColor(52, 73, 94);
      const tratamientoLines = doc.splitTextToSize(historial.tratamiento || "", 170);
      doc.text(tratamientoLines, 25, currentY + 17);
      currentY += 17 + (tratamientoLines.length * 7);

      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text("Próximo Seguimiento:", 20, currentY + 10);
      doc.setFontSize(11);
      doc.setTextColor(52, 73, 94);
      doc.text(historial.proximo_seguimiento ? new Date(historial.proximo_seguimiento).toLocaleDateString('es-CO') : "No especificado", 25, currentY + 17);

      currentY += 17;
      if (currentY > 250) doc.addPage();

      const yFirma = Math.max(currentY + 20, 250);
      doc.setDrawColor(127, 140, 141);
      doc.line(110, yFirma, 190, yFirma);
      doc.text(`Firma: Dr(a). ${historial.nombre_veterinario || 'N/A'}`, 110, yFirma + 7);
      doc.text("Médico Veterinario", 110, yFirma + 14);

      doc.save(`Historial_${historial.nombre_mascota || "Paciente"}_${historial.fecha}.pdf`);
      showNotification("PDF generado exitosamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      showNotification("Error al generar el PDF", "error");
    }
  };

  const openModal = (historial = null) => {
    setSelectedHistorial(historial);
    setIsEditing(!!historial);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedHistorial(null);
    setIsEditing(false);
  };

  const historialesFiltrados = historiales.filter(
    (h) =>
      h.nombre_mascota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.nombre_propietario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="historiales-medicos-container">
      <div className="historiales-medicos-header">
        <h1>Historiales Médicos</h1>
        <button onClick={() => openModal()} className="historiales-medicos-add-btn">
          <Plus size={20} /> Nuevo Historial
        </button>
      </div>
      <div className="historiales-medicos-search-container">
        <div className="historiales-medicos-search-box">
          <Search size={20} className="historiales-medicos-search-icon" />
          <input
            type="text"
            placeholder="Buscar por mascota, propietario o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="historiales-medicos-list">
        {loading ? (
          <div className="historiales-medicos-loading-message"><div className="historiales-medicos-loading-spinner"></div>Cargando historiales...</div>
        ) : error ? (
          <p className="historiales-medicos-error-message">{error}</p>
        ) : historialesFiltrados.length === 0 ? (
          <div className="historiales-medicos-empty-message">No hay historiales que coincidan con la búsqueda.</div>
        ) : (
          historialesFiltrados.map((historial) => (
            <HistorialCard
              key={historial.cod_his}
              historial={historial}
              onEdit={() => openModal(historial)}
              onDelete={() => handleDelete(historial.cod_his, historial.nombre_mascota)}
              onDownload={() => generarPDF(historial)}
              onViewLog={() => fetchHistorialLog(historial.cod_his)}
            />
          ))
        )}
      </div>

      {showModal && (
        <HistorialModal
          onClose={closeModal}
          onSubmit={handleSave}
          isEditing={isEditing}
          historial={selectedHistorial}
        />
      )}
      
      {showLogModal && (
        <HistorialLogModal 
            logs={logData}
            loading={loadingLogs}
            onClose={() => setShowLogModal(false)}
        />
      )}
    </div>
  );
}

// =================================================================================
// SUB-COMPONENTES
// =================================================================================

function HistorialCard({ historial, onEdit, onDelete, onDownload, onViewLog }) {
  return (
    <div className="historiales-medicos-card">
      <div className="historiales-medicos-card-header">
        <Stethoscope />
        <div>
          <h4>{historial.nombre_mascota}</h4>
          <p>Propietario: {historial.nombre_propietario} | Atendió: Dr(a). {historial.nombre_veterinario || "N/A"}</p>
        </div>
        <span>{new Date(historial.fecha).toLocaleDateString("es-CO")}</span>
      </div>
      <div className="historiales-medicos-card-body">
         <p><strong>Motivo:</strong> {historial.motivo_consulta || "No especificado"}</p>
        <p><strong>Descripción:</strong> {historial.descripcion}</p>
        <p><strong>Tratamiento:</strong> {historial.tratamiento}</p>
      </div>
      <div className="historiales-medicos-card-actions">
        <button onClick={onEdit} className="historiales-medicos-action-btn edit"><Edit size={16} /> Editar</button>
        <button onClick={onViewLog} className="historiales-medicos-action-btn log"><History size={16} /> Ver Log</button>
        <button onClick={onDownload} className="vet-action-btn download"><Download size={16} /> Descargar</button>
        <button onClick={onDelete} className="historiales-medicos-action-btn delete"><Trash2 size={16} /> Eliminar</button>
      </div>
    </div>
  );
}

function HistorialModal({ onClose, onSubmit, isEditing, historial }) {
  const [formData, setFormData] = useState({
    cod_mas: historial?.cod_mas || "",
    id_vet: historial?.id_vet || "",
    fecha: historial ? new Date(historial.fecha).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    descripcion: historial?.descripcion || "",
    tratamiento: historial?.tratamiento || "",
    motivo_consulta: historial?.motivo_consulta || "",
    peso_kg: historial?.peso_kg || "",
    temperatura_c: historial?.temperatura_c || "",
    proximo_seguimiento: historial?.proximo_seguimiento ? new Date(historial.proximo_seguimiento).toISOString().split("T")[0] : "",
    costo_consulta: historial?.costo_consulta || "0",
    cod_his: historial?.cod_his || null,
  });

  const [propietarios, setPropietarios] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [selectedPropietario, setSelectedPropietario] = useState(historial ? historial.id_pro : "");
  const [loadingMascotas, setLoadingMascotas] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propietariosRes, veterinariosRes] = await Promise.all([
          apiService.get("/api/roles/propietarios"),
          apiService.get("/api/servicios/veterinarios")
        ]);
        if (propietariosRes.success) setPropietarios(propietariosRes.propietarios || []);
        setVeterinarios(veterinariosRes || []);
      } catch (error) {
        console.error("Error fetching data for modal", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedPropietario) {
      setMascotas([]);
      return;
    }
    const fetchMascotas = async () => {
      setLoadingMascotas(true);
      try {
        const response = await apiService.get(`/api/mascota/propietario/${selectedPropietario}`);
        if (response.success) setMascotas(response.mascotas || []);
      } catch (error) {
        console.error("Error fetching mascotas", error);
        setMascotas([]);
      } finally {
        setLoadingMascotas(false);
      }
    };
    fetchMascotas();
  }, [selectedPropietario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePropietarioChange = (e) => {
    setSelectedPropietario(e.target.value);
    setFormData((prev) => ({ ...prev, cod_mas: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.cod_mas && !isEditing) {
      Swal.fire({ icon: "error", title: "Error de validación", text: "Debes seleccionar un propietario y una mascota." });
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="historiales-medicos-modal-overlay" onClick={onClose}>
      <div className="historiales-medicos-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="historiales-medicos-modal-header">
          <h2>{isEditing ? "Editar" : "Nuevo"} Historial Médico</h2>
          <button onClick={onClose} className="historiales-medicos-modal-close-btn">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="historiales-medicos-modal-body">
          {!isEditing && (
            <>
              <div className="historiales-medicos-form-group">
                <label><User size={16} /> Propietario</label>
                <select value={selectedPropietario} onChange={handlePropietarioChange} required={!isEditing}>
                  <option value="">-- Seleccionar Propietario --</option>
                  {propietarios.map((p) => (<option key={p.id_pro} value={p.id_pro}>{p.nombre} {p.apellido}</option>))}
                </select>
              </div>
              <div className="historiales-medicos-form-group">
                <label><Dog size={16} /> Mascota</label>
                <select name="cod_mas" value={formData.cod_mas} onChange={handleChange} required={!isEditing} disabled={!selectedPropietario || loadingMascotas}>
                  <option value="">{loadingMascotas ? "Cargando..." : "-- Seleccionar Mascota --"}</option>
                  {mascotas.map((m) => (<option key={m.cod_mas} value={m.cod_mas}>{m.nom_mas}</option>))}
                </select>
              </div>
            </>
          )}
          {isEditing && (
            <div className="historiales-medicos-form-group">
              <label>Paciente</label>
              <input type="text" value={`${historial.nombre_mascota} (Propietario: ${historial.nombre_propietario})`} disabled />
            </div>
          )}
          <div className="historiales-medicos-form-group">
            <label><Stethoscope size={16} /> Veterinario</label>
            <select name="id_vet" value={formData.id_vet} onChange={handleChange} required>
              <option value="">-- Seleccionar Veterinario --</option>
              {veterinarios.map((vet) => (<option key={vet.id_usuario} value={vet.id_usuario}>Dr. {vet.nombre} {vet.apellido}</option>))}
            </select>
          </div>
          <div className="historiales-medicos-form-group">
            <label><FilePlus size={16} /> Motivo de Consulta</label>
            <input type="text" name="motivo_consulta" value={formData.motivo_consulta} onChange={handleChange} required />
          </div>
          <div className="historiales-medicos-form-group">
            <label><Calendar size={16} /> Fecha</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="historiales-medicos-form-group">
              <label><Weight size={16} /> Peso (kg)</label>
              <input type="number" step="0.1" name="peso_kg" value={formData.peso_kg} onChange={handleChange} />
            </div>
            <div className="historiales-medicos-form-group">
              <label><Thermometer size={16} /> Temp (°C)</label>
              <input type="number" step="0.1" name="temperatura_c" value={formData.temperatura_c} onChange={handleChange} />
            </div>
          </div>
          <div className="historiales-medicos-form-group">
            <label><FileText size={16} /> Descripción</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required rows="4"></textarea>
          </div>
          <div className="historiales-medicos-form-group">
            <label><Stethoscope size={16} /> Tratamiento</label>
            <textarea name="tratamiento" value={formData.tratamiento} onChange={handleChange} required rows="4"></textarea>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="historiales-medicos-form-group">
              <label><Calendar size={16} /> Próximo Seguimiento</label>
              <input type="date" name="proximo_seguimiento" value={formData.proximo_seguimiento} onChange={handleChange} />
            </div>
            <div className="historiales-medicos-form-group">
              <label><i className="fas fa-dollar-sign"></i> Costo (COP)</label>
              <input type="number" step="1000" name="costo_consulta" value={formData.costo_consulta} onChange={handleChange} />
            </div>
          </div>
          <div className="historiales-medicos-modal-footer">
            <button type="button" className="historiales-medicos-cancel-button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="historiales-medicos-submit-button">{isEditing ? "Actualizar" : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HistorialLogModal({ logs, loading, onClose }) {
    const getActionIcon = (action) => {
        switch(action) {
            case 'CREACION': return <FilePlus size={16} className="log-icon creation" />;
            case 'MODIFICACION': return <Edit size={16} className="log-icon modification" />;
            case 'ELIMINACION': return <Trash2 size={16} className="log-icon deletion" />;
            default: return null;
        }
    };

    return (
        <div className="historiales-medicos-modal-overlay" onClick={onClose}>
            <div className="historiales-medicos-modal-container log-modal" onClick={(e) => e.stopPropagation()}>
                <div className="historiales-medicos-modal-header log-header">
                    <h2><History size={20} /> Historial de Cambios</h2>
                    <button onClick={onClose} className="historiales-medicos-modal-close-btn"><X size={20} /></button>
                </div>
                <div className="historiales-medicos-modal-body">
                    {loading ? (
                        <div className="historiales-medicos-loading-message">
                            <div className="historiales-medicos-loading-spinner"></div>Cargando historial...
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="historiales-medicos-empty-message">No hay cambios registrados para este historial.</div>
                    ) : (
                        <ul className="log-list">
                            {logs.map((log, index) => (
                                <li key={index} className={`log-item log-item-${log.accion.toLowerCase()}`}>
                                    <div className="log-item-header">
                                        <div className="log-item-action">
                                            {getActionIcon(log.accion)}
                                            <span>{log.accion}</span>
                                        </div>
                                        <div className="log-item-meta">
                                            <span className="log-user"><UserCheck size={14} />{log.nombre_modificador}</span>
                                            <span className="log-date"><Clock size={14} />{new Date(log.fecha_modificacion).toLocaleString('es-CO')}</span>
                                        </div>
                                    </div>
                                    {(log.accion === 'MODIFICACION' || log.accion === 'ELIMINACION') && (
                                        <div className="log-item-details">
                                            <p><strong>Descripción Anterior:</strong> {log.descripcion_anterior || 'N/A'}</p>
                                            <p><strong>Tratamiento Anterior:</strong> {log.tratamiento_anterior || 'N/A'}</p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}