"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Plus, Search, Edit, Trash2, Stethoscope, User, Dog, Calendar, FileText, X, Download, Thermometer, Weight, FilePlus, History, Clock, UserCheck } from "lucide-react";
import { apiService } from "../services/api-service";
import jsPDF from "jspdf";
import "../stylos/vet/HistorialesMedicos.css";
import "../stylos/vet/loadingvet.css";
import logoUrl from '../img/logo.png';

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
      const response = await apiService.get("/api/historiales/");
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
      doc.text(historial.nombre_veterinario || `${userData.nombre} ${userData.apellido}`, pageWidth / 2, yFirma + 12, { align: 'center' });

      doc.save(`Historial_${historial.nombre_mascota || "Paciente"}_${new Date(historial.fecha).toLocaleDateString('es-CO')}.pdf`);
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
          historialesExistentes={historiales}
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
  // AJUSTE CLAVE: Usamos la URL completa de Cloudinary directamente desde historial.foto
  const imageUrl = historial.foto;

  return (
    <div className="historiales-medicos-card">
      <div className="historiales-medicos-card-header">
        {/* Se muestra la foto si existe, si no, el icono por defecto */}
        {imageUrl ? (
          <img src={imageUrl} alt={historial.nombre_mascota} className="historiales-medicos-card-photo" />
        ) : (
          <Stethoscope />
        )}
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

// EL RESTO DEL ARCHIVO NO NECESITA CAMBIOS
function HistorialModal({ onClose, onSubmit, isEditing, historial, historialesExistentes }) {
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    cod_mas: historial?.cod_mas || "",
    id_vet: loggedInUser.id_usuario,
    fecha: new Date().toISOString().split("T")[0],
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
  const [selectedPropietario, setSelectedPropietario] = useState(historial ? historial.id_pro : "");
  const [loadingMascotas, setLoadingMascotas] = useState(false);

  useEffect(() => {
    const fetchPropietarios = async () => {
      try {
        const propietariosRes = await apiService.get("/api/roles/propietarios");
        if (propietariosRes.success) {
          setPropietarios(propietariosRes.propietarios || []);
        }
      } catch (error) {
        console.error("Error fetching propietarios for modal", error);
      }
    };
    fetchPropietarios();
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

    if (!isEditing) {
      const mascotaYaTieneHistorial = historialesExistentes.some(h => h.cod_mas === parseInt(formData.cod_mas));
      if (mascotaYaTieneHistorial) {
        Swal.fire({ icon: 'error', title: 'Operación no permitida', text: 'Esta mascota ya tiene un historial médico registrado. Por favor, edite el existente.' });
        return;
      }
    }

    if (!formData.cod_mas && !isEditing) {
      Swal.fire({ icon: "error", title: "Error de validación", text: "Debes seleccionar un propietario y una mascota." });
      return;
    }

    const peso = parseFloat(formData.peso_kg);
    if (peso && (peso > 70 || peso < 0.1)) {
        Swal.fire({ icon: 'error', title: 'Peso no válido', text: 'El peso debe estar entre 0.1 kg y 70 kg.' });
        return;
    }

    const costo = parseFloat(formData.costo_consulta);
    if (costo && (costo > 3000000 || costo < 0)) {
        Swal.fire({ icon: 'error', title: 'Costo no válido', text: 'El costo no puede ser negativo ni superar los $3,000,000 COP.' });
        return;
    }
    
    onSubmit(formData);
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

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
            <label><FilePlus size={16} /> Motivo de Consulta</label>
            <input type="text" name="motivo_consulta" value={formData.motivo_consulta} onChange={handleChange} required />
          </div>
          <div className="historiales-medicos-form-group">
            <label><Calendar size={16} /> Fecha de la Consulta</label>
            <input type="date" name="fecha" value={formData.fecha} readOnly disabled />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="historiales-medicos-form-group">
              <label><Weight size={16} /> Peso (kg)</label>
              <input type="number" step="0.1" name="peso_kg" value={formData.peso_kg} onChange={handleChange} placeholder="Ej: 5.4"/>
            </div>
            <div className="historiales-medicos-form-group">
              <label><Thermometer size={16} /> Temp (°C)</label>
              <input type="number" step="0.1" name="temperatura_c" value={formData.temperatura_c} onChange={handleChange} placeholder="Ej: 38.5"/>
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
              <label><Calendar size={16} /> Próximo Seguimiento Sugerido</label>
              <input type="date" name="proximo_seguimiento" value={formData.proximo_seguimiento} onChange={handleChange} min={minDateStr} max={maxDateStr} />
              <small className="form-helper-text">Solo se puede agendar hasta un mes a futuro.</small>
            </div>
            <div className="historiales-medicos-form-group">
              <label>Costo Consulta (COP)</label>
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