import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import { apiService } from '../services/api-service';
import '../stylos/Admin/GestionCitasAdmin.css';
import { FaPlus, FaEdit, FaTrash, FaHistory, FaTimes, FaCalendarAlt, FaFilter, FaSearch } from 'react-icons/fa';

// --- Componente Local: Modal para Crear/Editar Citas ---
const CitaModalAdmin = ({ isOpen, onClose, cita, onSave, propietarios, mascotas, veterinarios, servicios }) => {
    const isEditing = !!cita;

    const getInitialState = () => {
        if (isEditing) {
            return {
                id_pro: cita.id_pro || '',
                cod_mas: cita.cod_mas || '',
                cod_ser: cita.cod_ser || '',
                id_vet: cita.id_vet || '',
                fech_cit: cita.fech_cit ? new Date(cita.fech_cit).toISOString().split('T')[0] : '',
                hora: cita.hora || '',
                est_cit: cita.est_cit || 'PENDIENTE',
                notas: cita.notas || ''
            };
        }
        return { 
            id_pro: '', cod_mas: '', cod_ser: '', id_vet: '', fech_cit: '',
            hora: '', est_cit: 'PENDIENTE', notas: ''
        };
    };
    
    const [formData, setFormData] = useState(getInitialState());
    const [mascotasFiltradas, setMascotasFiltradas] = useState([]);

    useEffect(() => {
        setFormData(getInitialState());
    }, [isOpen, cita]);

    useEffect(() => {
        document.title = 'Gestión Citas - Petty\'s Paradise'; // Título para la página de inicio
      });

    useEffect(() => {
        if (formData.id_pro && Array.isArray(mascotas)) {
            const mascotasDelPropietario = mascotas.filter(m => m.id_pro === parseInt(formData.id_pro));
            setMascotasFiltradas(mascotasDelPropietario);
        } else {
            setMascotasFiltradas([]);
        }
    }, [formData.id_pro, mascotas]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'id_pro') {
            setFormData(prev => ({ ...prev, cod_mas: '' }));
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="citas-modal-overlay" onClick={onClose}>
            <div className="citas-modal-content" onClick={e => e.stopPropagation()}>
                <div className="citas-modal-header">
                    <h3 className="citas-modal-title">
                        {isEditing ? 'Editar Cita' : 'Crear Nueva Cita'}
                    </h3>
                    <button onClick={onClose} className="citas-modal-close">
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="citas-form">
                    <div className="citas-form-grid">
                        <div className="citas-form-group">
                            <label className="citas-form-label">Propietario *</label>
                            <select 
                                name="id_pro" 
                                value={formData.id_pro} 
                                onChange={handleChange} 
                                className="citas-form-select"
                                required
                            >
                                <option value="">-- Seleccione Propietario --</option>
                                {propietarios.map(p => (
                                    <option key={`prop-${p.id_usuario}`} value={p.id_usuario}>
                                        {p.nombre} {p.apellido} - {p.id_usuario}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="citas-form-group">
                            <label className="citas-form-label">Mascota *</label>
                            <select 
                                name="cod_mas" 
                                value={formData.cod_mas} 
                                onChange={handleChange} 
                                className="citas-form-select"
                                required 
                                disabled={!formData.id_pro}
                            >
                                <option value="">-- Seleccione Mascota --</option>
                                {mascotasFiltradas.map(m => (
                                    <option key={`masc-${m.cod_mas}`} value={m.cod_mas}>
                                        {m.nom_mas}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="citas-form-group">
                            <label className="citas-form-label">Fecha *</label>
                            <input 
                                type="date" 
                                name="fech_cit" 
                                value={formData.fech_cit} 
                                onChange={handleChange} 
                                className="citas-form-input"
                                required 
                            />
                        </div>
                        
                        <div className="citas-form-group">
                            <label className="citas-form-label">Hora *</label>
                            <input 
                                type="time" 
                                name="hora" 
                                value={formData.hora} 
                                onChange={handleChange} 
                                className="citas-form-input"
                                required 
                            />
                        </div>
                        
                        <div className="citas-form-group">
                            <label className="citas-form-label">Servicio *</label>
                            <select 
                                name="cod_ser" 
                                value={formData.cod_ser} 
                                onChange={handleChange} 
                                className="citas-form-select"
                                required
                            >
                                <option value="">-- Seleccione Servicio --</option>
                                {servicios.map(s => (
                                    <option key={`ser-${s.cod_ser}`} value={s.cod_ser}>
                                        {s.nom_ser}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="citas-form-group">
                            <label className="citas-form-label">Veterinario *</label>
                            <select 
                                name="id_vet" 
                                value={formData.id_vet} 
                                onChange={handleChange} 
                                className="citas-form-select"
                                required
                            >
                                <option value="">-- Seleccione Veterinario --</option>
                                {veterinarios.map(v => (
                                    <option key={`vet-${v.id_usuario}`} value={v.id_usuario}>
                                        Dr. {v.nombre} {v.apellido}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {isEditing && (
                            <div className="citas-form-group">
                                <label className="citas-form-label">Estado</label>
                                <select 
                                    name="est_cit" 
                                    value={formData.est_cit} 
                                    onChange={handleChange} 
                                    className="citas-form-select"
                                    required
                                >
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="CONFIRMADA">Confirmada</option>
                                    <option value="CANCELADA">Cancelada</option>
                                    <option value="COMPLETADA">Completada</option>
                                </select>
                            </div>
                        )}
                    </div>
                    
                    <div className="citas-form-group citas-form-group-full">
                        <label className="citas-form-label">Notas</label>
                        <textarea 
                            name="notas" 
                            value={formData.notas} 
                            onChange={handleChange}
                            className="citas-form-textarea"
                            rows="3"
                            placeholder="Observaciones adicionales sobre la cita..."
                        />
                    </div>
                    
                    <div className="citas-form-actions">
                        <button type="button" onClick={onClose} className="citas-btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="citas-btn-primary">
                            {isEditing ? 'Actualizar Cita' : 'Crear Cita'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Componente Local: Modal de Historial ---
const HistorialLogModal = ({ citaId, onClose, citas }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const citaInfo = useMemo(() => citas.find(c => c.cod_cit === citaId), [citas, citaId]);

    useEffect(() => {
        if (!citaId) return;
        const fetchLogData = async () => {
            setLoading(true);
            try {
                const response = await apiService.get(`/api/citas/admin/${citaId}/logs`);
                setLogs(response || []);
            } catch (error) { 
                Swal.fire('Error', 'No se pudo cargar el historial de cambios.', 'error'); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchLogData();
    }, [citaId]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-CO', { 
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    return (
        <div className="citas-modal-overlay" onClick={onClose}>
            <div className="citas-modal-content citas-modal-large" onClick={e => e.stopPropagation()}>
                <div className="citas-modal-header">
                    <h3 className="citas-modal-title">
                        <FaHistory /> Historial de Cita #{citaId}
                    </h3>
                    <button onClick={onClose} className="citas-modal-close">
                        <FaTimes />
                    </button>
                </div>
                
                {citaInfo && (
                    <div className="citas-info-banner">
                        <div className="citas-info-item">
                            <strong>Mascota:</strong> {citaInfo.mascota}
                        </div>
                        <div className="citas-info-item">
                            <strong>Propietario:</strong> {citaInfo.propietario}
                        </div>
                    </div>
                )}
                
                <div className="citas-modal-body">
                    {loading ? (
                        <div className="citas-loading-container">
                            <div className="citas-loading-spinner"></div>
                            <p className="citas-loading-text">Cargando historial...</p>
                        </div>
                    ) : logs.length > 0 ? (
                        <div className="citas-table-container">
                        
                            <table className="citas-table">
                                <thead>
                                    <tr>
                                        <th>Fecha del Cambio</th>
                                        <th>Acción</th>
                                        <th>Realizado por</th>
                                        <th>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log.id_log}>
                                            <td>{formatDate(log.fecha_hora)}</td>
                                            <td>
                                                <span className="citas-badge citas-badge-action">
                                                    {log.nivel}
                                                </span>
                                            </td>
                                            <td>{log.usuario_modificador}</td>
                                            <td className="citas-log-description">{log.mensaje}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="citas-no-data">
                            <FaHistory size={48} />
                            <h4>Sin registros de auditoría</h4>
                            <p>No se encontraron registros de cambios para esta cita.</p>
                        </div>
                    )}
                </div>
                
                <div className="citas-form-actions">
                    <button type="button" onClick={onClose} className="citas-btn-secondary">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal ---
const GestionCitasAdmin = () => {
    const [citas, setCitas] = useState([]);
    const [propietarios, setPropietarios] = useState([]);
    const [veterinarios, setVeterinarios] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentCita, setCurrentCita] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedCitaId, setSelectedCitaId] = useState(null);
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroEst_Cit, setFiltroEstado] = useState('');

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [citasRes, usersRes, mascotasRes, serviciosRes] = await Promise.all([
                apiService.get("/api/citas/admin/todas"),
                apiService.get('/api/users'),
                apiService.get('/api/mascota/todas'),
                apiService.get('/api/servicios/servicios')
            ]);
            if (Array.isArray(usersRes)) {
            // Filtra el arreglo basándote en la propiedad 'id_rol' que viene de la API
            // (Asegúrate de que los IDs de rol 2 y 3 sean los correctos para tu sistema)
            const veterinariosFiltrados = usersRes.filter(user => user.id_rol === 2);
            const propietariosFiltrados = usersRes.filter(user => user.id_rol === 3);

            setPropietarios(propietariosFiltrados);
            setVeterinarios(veterinariosFiltrados);
        }
            setCitas(citasRes || []);
            // FIX: Use 'usersRes' which likely contains arrays for propietarios and veterinarios
         
            // FIX: Use 'mascotasRes' for mascotas
            setMascotas(mascotasRes || []);
            // FIX: Use 'serviciosRes' for servicios
            setServicios(serviciosRes || []);

        } catch (error) {
            setError(`Error al cargar los datos: ${error.message}`);
            Swal.fire('Error Crítico', `No se pudieron cargar los datos: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);
    
    const handleOpenCreateModal = () => { 
        setCurrentCita(null); 
        setIsEditing(false); 
        setShowModal(true); 
    };
    
    const handleOpenEditModal = (cita) => { 
        setCurrentCita(cita); 
        setIsEditing(true); 
        setShowModal(true); 
    };
    
    const handleSaveCita = async (formData) => {
        try {
            if (isEditing) {
                await apiService.put(`/api/citas/admin/${currentCita.cod_cit}/act`, formData);
                Swal.fire('Éxito', 'Cita actualizada correctamente.', 'success');
            } else {
                await apiService.post('/api/citas/admin', formData);
                Swal.fire('Éxito', 'Cita creada correctamente.', 'success');
            }
            setShowModal(false);
            fetchAllData();
        } catch (error) { 
            const action = isEditing ? "actualizar" : "crear";
            Swal.fire('Error', `No se pudo ${action} la cita. ${error.message || ''}`, 'error'); 
        }
    };

    const handleDeleteCita = (cod_cit) => {
        Swal.fire({
            title: '¿Estás seguro?', 
            text: "¡No podrás revertir esta acción!", 
            icon: 'warning',
            showCancelButton: true, 
            confirmButtonColor: '#d33', 
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar', 
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await apiService.delete(`/api/citas/admin/${cod_cit}`);
                    Swal.fire('Eliminada', 'La cita ha sido eliminada.', 'success');
                    fetchAllData();
                } catch (error) {
                    Swal.fire('Error', `No se pudo eliminar la cita: ${error.message}`, 'error');
                }
            }
        });
    };
    
    const handleViewLogs = (citaId) => { 
        setSelectedCitaId(citaId); 
        setShowLogModal(true); 
    };

    const citasFiltradas = useMemo(() => {
        if (!Array.isArray(citas)) return [];
        return citas.filter(cita => {
            const fechaCita = new Date(cita.fech_cit).toISOString().split('T')[0];
            const matchFecha = !filtroFecha || fechaCita === filtroFecha;
            const matchEstado = !filtroEst_Cit || cita.est_cit === filtroEst_Cit;
            return matchFecha && matchEstado;
        });
    }, [citas, filtroFecha,filtroEst_Cit]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CO', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        });
    };

    const getEstadoStats = () => {
        const stats = {
            total: citas.length,
            pendientes: citas.filter(c => c.est_cit === 'PENDIENTE').length,
            confirmadas: citas.filter(c => c.est_cit === 'CONFIRMADA').length,
            completadas: citas.filter(c => c.est_cit === 'COMPLETADA').length,
            canceladas: citas.filter(c => c.est_cit === 'CANCELADA').length
        };
        return stats;
    };

    const stats = getEstadoStats();

    if (loading) { 
        return (
            <div className="gestion-citas-container">
                <div className="citas-loading-container">
                    <div className="citas-loading-spinner"></div>
                    <p className="citas-loading-text">Cargando gestión de citas...</p>
                </div>
            </div>
        ); 
    }

    return (
        <div className="gestion-citas-container">
            {/* Header Principal */}
            <div className="citas-page-header">
                <div className="citas-header-content">
                    <div className="citas-title-section">
                        <h1>Gestión Global de Citas</h1>
                        <p>Administra todas las citas del sistema veterinario</p>
                    </div>
                    <button className="citas-create-btn" onClick={handleOpenCreateModal}>
                        <FaPlus /> Crear Cita
                    </button>
                </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
                <div className="citas-error-message">
                    <span>⚠️ {error}</span>
                    <button onClick={fetchAllData} className="citas-btn-retry">
                        Reintentar
                    </button>
                </div>
            )}

            {/* Estadísticas */}
            <div className="citas-stats-grid">
                <div className="citas-stat-card">
                    <span className="citas-stat-number">{stats.total}</span>
                    <span className="citas-stat-label">Total Citas</span>
                </div>
                <div className="citas-stat-card">
                    <span className="citas-stat-number citas-stat-pendiente">{stats.pendientes}</span>
                    <span className="citas-stat-label">Pendientes</span>
                </div>
                <div className="citas-stat-card">
                    <span className="citas-stat-number citas-stat-confirmada">{stats.confirmadas}</span>
                    <span className="citas-stat-label">Confirmadas</span>
                </div>
                <div className="citas-stat-card">
                    <span className="citas-stat-number citas-stat-completada">{stats.completadas}</span>
                    <span className="citas-stat-label">Completadas</span>
                </div>
            </div>

            {/* Filtros */}
            <div className="citas-filters-container">
                <div className="citas-filters-content">
                    <div className="citas-filter-group">
                        <label className="citas-filter-label">
                            <FaCalendarAlt /> Filtrar por Fecha:
                        </label>
                        <input 
                            type="date" 
                            value={filtroFecha} 
                            onChange={e => setFiltroFecha(e.target.value)}
                            className="citas-filter-input"
                        />
                    </div>
                    <div className="citas-filter-group">
                        <label className="citas-filter-label">
                            <FaFilter /> Filtrar por Estado:
                        </label>
                        <select 
                            value={filtroEst_Cit} 
                            onChange={e => setFiltroEstado(e.target.value)}
                            className="citas-filter-select"
                        >
                            <option value="">Todos los Estados</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="CONFIRMADA">Confirmada</option>
                            <option value="CANCELADA">Cancelada</option>
                            <option value="COMPLETADA">Completada</option>
                        </select>
                    </div>
                    <button 
                        className="citas-clear-filters-btn" 
                        onClick={() => { setFiltroFecha(''); setFiltroEstado(''); }}
                    >
                        Limpiar Filtros
                    </button>
                </div>
            </div>

            {/* Tabla de Citas */}
            <div className="citas-table-container">
                <table className="citas-table">
                    <thead>
                        <tr>
                            <th>Fecha y Hora</th>
                            <th>Estado</th>
                            <th>Propietario</th>
                            <th>Mascota</th>
                            <th>Veterinario</th>
                            <th>Servicio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citasFiltradas.length > 0 ? citasFiltradas.map(cita => (
                            <tr key={cita.cod_cit}>
                                <td>
                                    <div className="citas-date-info">
                                        <div className="citas-date">{formatDate(cita.fech_cit)}</div>
                                        <div className="citas-time">{cita.hora}</div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`citas-badge citas-badge-${cita.est_cit.toLowerCase()}`}>
                                        {cita.est_cit}
                                    </span>
                                </td>
                                <td>
                                    <div className="citas-person-info">
                                        <div className="citas-person-name">{cita.propietario}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="citas-pet-info">
                                        <div className="citas-pet-name">{cita.mascota}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="citas-vet-info">
                                        <div className="citas-vet-name">{cita.veterinario}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="citas-service-info">
                                        {cita.servicio}
                                    </div>
                                </td>
                                <td>
                                    <div className="citas-action-buttons">
                                        <button 
                                            onClick={() => handleOpenEditModal(cita)} 
                                            className="citas-btn-icon citas-btn-edit" 
                                            title="Editar Cita"
                                        >
                                            <FaEdit />
                                        </button>
                                       
                                        <button 
                                            onClick={() => handleViewLogs(cita.cod_cit)} 
                                            className="citas-btn-icon citas-btn-history" 
                                            title="Ver Historial"
                                        >
                                            <FaHistory />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="citas-no-data">
                                    <FaSearch size={48} />
                                    <h4>No se encontraron citas</h4>
                                    <p>No hay citas que coincidan con los filtros seleccionados.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modales */}
            <CitaModalAdmin 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                cita={currentCita} 
                onSave={handleSaveCita} 
                propietarios={propietarios} 
                mascotas={mascotas} 
                veterinarios={veterinarios} 
                servicios={servicios}
            />

            {showLogModal && (
                <HistorialLogModal 
                    citaId={selectedCitaId} 
                    citas={citas} 
                    onClose={() => setShowLogModal(false)} 
                />
            )}
        </div>
    );
};

export default GestionCitasAdmin;
