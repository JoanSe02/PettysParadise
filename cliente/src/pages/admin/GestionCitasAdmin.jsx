// RUTA: cliente/src/pages/admin/GestionCitasAdmin.jsx (VERSIÓN FINAL Y SIMPLIFICADA)

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from '../../services/api-service';
import Swal from 'sweetalert2';
import { FaHistory, FaEdit, FaTrash, FaPlus, FaArrowLeft, FaTimes } from 'react-icons/fa';
import '../../stylos/Admin/GestionCitasAdmin.css';

// ====================================================================
// --- Componente Local: Modal para Editar Citas ---
// ====================================================================
const CitaModalAdmin = ({ isOpen, onClose, cita, onSave, propietarios, mascotas, veterinarios, servicios }) => {
    const [formData, setFormData] = useState({});
    const [mascotasFiltradas, setMascotasFiltradas] = useState([]);

    // Este useEffect se activa solo cuando la cita a editar cambia.
    useEffect(() => {
        if (cita) {
            setFormData({
                id_pro: cita.id_pro || '',
                cod_mas: cita.cod_mas || '',
                cod_ser: cita.cod_ser || '',
                id_vet: cita.id_vet || '',
                fech_cit: cita.fech_cit ? new Date(cita.fech_cit).toISOString().split('T')[0] : '',
                hora: cita.hora || '',
                estado: cita.estado || 'PENDIENTE',
                notas: cita.notas || ''
            });
            // Filtramos las mascotas del propietario de la cita actual
            setMascotasFiltradas(mascotas.filter(m => m.id_pro === cita.id_pro));
        }
    }, [cita, mascotas]); // Dependencias estables para evitar bucles

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = (name === 'id_pro' || name === 'cod_mas' || name === 'cod_ser' || name === 'id_vet')
            ? parseInt(value, 10) || ''
            : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));

        if (name === 'id_pro') {
            setFormData(prev => ({ ...prev, cod_mas: '' }));
            setMascotasFiltradas(mascotas.filter(m => m.id_pro === newValue));
        }
    };

    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    if (!isOpen) return null;

    // El JSX del modal es el mismo
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>{`Editar Cita #${cita.cod_cit}`}</h3><button onClick={onClose} className="modal-close-btn"><FaTimes /></button></div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group"><label>Propietario</label><select name="id_pro" value={formData.id_pro} onChange={handleChange} required><option value="">Seleccione</option>{propietarios.map(p => <option key={p.id_usuario} value={p.id_usuario}>{p.nombre} {p.apellido}</option>)}</select></div>
                        <div className="form-group"><label>Mascota</label><select name="cod_mas" value={formData.cod_mas} onChange={handleChange} required disabled={!formData.id_pro}><option value="">Seleccione</option>{mascotasFiltradas.map(m => <option key={m.cod_mas} value={m.cod_mas}>{m.nom_mas}</option>)}</select></div>
                        <div className="form-group"><label>Servicio</label><select name="cod_ser" value={formData.cod_ser} onChange={handleChange} required><option value="">Seleccione</option>{servicios.map(s => <option key={s.cod_ser} value={s.cod_ser}>{s.nom_ser}</option>)}</select></div>
                        <div className="form-group"><label>Veterinario</label><select name="id_vet" value={formData.id_vet} onChange={handleChange} required><option value="">Seleccione</option>{veterinarios.map(v => <option key={v.id_usuario} value={v.id_usuario}>Dr. {v.nombre} {v.apellido}</option>)}</select></div>
                        <div className="form-group"><label>Fecha</label><input type="date" name="fech_cit" value={formData.fech_cit} onChange={handleChange} required /></div>
                        <div className="form-group"><label>Hora</label><input type="time" name="hora" value={formData.hora} onChange={handleChange} required /></div>
                        <div className="form-group"><label>Estado</label><select name="estado" value={formData.estado} onChange={handleChange} required><option value="PENDIENTE">Pendiente</option><option value="CONFIRMADA">Confirmada</option><option value="REALIZADA">Realizada</option><option value="CANCELADA">Cancelada</option><option value="NO_ASISTIDA">No Asistida</option></select></div>
                        <div className="form-group full-width"><label>Notas</label><textarea name="notas" value={formData.notas} onChange={handleChange} rows="3"></textarea></div>
                    </div>
                    <div className="modal-footer"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Guardar Cambios</button></div>
                </form>
            </div>
        </div>
    );
};

// ====================================================================
// --- Componente Local: Vista para el Historial de una Cita ---
// ====================================================================
const HistorialView = ({ citaId, onBack, citas }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const citaInfo = useMemo(() => citas.find(c => c.cod_cit === citaId), [citas, citaId]);

    useEffect(() => {
        const fetchLogData = async () => {
            setLoading(true);
            try {
                // Usamos la ruta que ya tienes para obtener TODOS los logs
                const allLogs = await apiService.get(`/api/logs/citas`);
                // Filtramos los logs para esta cita en el lado del cliente
                setLogs(allLogs.filter(log => log.id_cita_afectada === citaId));
            } catch (error) { Swal.fire('Error', 'No se pudo cargar el historial.', 'error');
            } finally { setLoading(false); }
        };
        if (citaId) fetchLogData();
    }, [citaId]);

    return (
        <div className="admin-page-content">
            <header className="historial-cita-header"><div><button onClick={onBack} className="back-link"><FaArrowLeft /> Volver a Citas</button><h1>Historial de Cita #{citaId}</h1>{citaInfo && <div className="cita-info-banner"><span><strong>Mascota:</strong> {citaInfo.mascota}</span><span><strong>Propietario:</strong> {citaInfo.propietario}</span></div>}</div></header>
            <div className="historial-cita-body">
                {loading ? <div className="loading-spinner">Cargando...</div> : (
                    logs.length > 0 ? (
                        <div className="table-container"><p className="log-note">Nota: "Realizado por" muestra el usuario de la base de datos (`root@localhost`) por la configuración actual de los Triggers.</p><table className="data-table"><thead><tr><th>ID Log</th><th>Acción</th><th>Realizado Por (BD)</th><th>Fecha y Hora</th><th>Descripción</th></tr></thead><tbody>{logs.map(log => (<tr key={log.log_id}><td>{log.log_id}</td><td><span className={`status-badge ${log.accion?.toLowerCase()}`}>{log.accion}</span></td><td>{log.id_usuario_modificador}</td><td>{new Date(log.fecha_modificacion).toLocaleString('es-CO')}</td><td><pre className="log-description">{log.descripcion}</pre></td></tr>))}</tbody></table></div>
                    ) : <div className="no-logs-message"><p>No se encontraron registros de auditoría para esta cita.</p></div>
                )}
            </div>
        </div>
    );
};

// ====================================================================
// --- Componente Principal: GestionCitasAdmin ---
// ====================================================================
const GestionCitasAdmin = () => {
    const [view, setView] = useState('list');
    const [selectedCitaId, setSelectedCitaId] = useState(null);
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentCita, setCurrentCita] = useState(null);

    // SOLUCIÓN AL BUCLE: Estados individuales para los datos de los formularios.
    // Sus referencias son estables y no causan re-renders infinitos.
    const [propietarios, setPropietarios] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [veterinarios, setVeterinarios] = useState([]);
    const [servicios, setServicios] = useState([]);

    // Esta función ahora carga TODOS los datos necesarios de una sola vez.
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [citasRes, usersRes, mascotasRes, serviciosRes] = await Promise.all([
                apiService.get("/api/citas/admin/todas"),
                apiService.get('/api/users'),
                apiService.get('/api/mascotas/todas'),
                apiService.get('/api/servicios')
            ]);
            setCitas(citasRes);
            setPropietarios(usersRes.filter(u => u.id_rol === 3));
            setVeterinarios(usersRes.filter(u => u.id_rol === 2));
            setMascotas(mascotasRes);
            setServicios(serviciosRes);
        } catch (error) {
            Swal.fire('Error Crítico de Conexión', 'No se pudieron cargar los datos iniciales. Asegúrate de que el servidor backend esté corriendo y las rutas como /api/citas/admin/todas y /api/users funcionen.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleOpenEditModal = (cita) => { setCurrentCita(cita); setShowModal(true); };
    const handleViewLogs = (citaId) => { setSelectedCitaId(citaId); setView('history'); };
    const handleReturnToList = () => { setView('list'); setSelectedCitaId(null); fetchAllData(); };

    const handleSaveCita = async (formData) => {
        try {
            await apiService.put(`/api/citas/${currentCita.cod_cit}`, formData);
            Swal.fire('Éxito', 'Cita actualizada.', 'success');
            setShowModal(false);
            fetchAllData(); // Recargamos la información
        } catch (error) { Swal.fire('Error', `No se pudo guardar la cita: ${error.message}`, 'error'); }
    };
    
    const handleCancelCita = (cita) => {
        Swal.fire({
            title: '¿Estás seguro?', html: `Se cancelará la cita de <b>${cita.mascota}</b>.`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#d33', cancelButtonText: 'No', confirmButtonText: 'Sí, cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await apiService.put(`/api/citas/${cita.cod_cit}/cancelar`);
                    Swal.fire('Cancelada', 'La cita se ha cancelado.', 'success');
                    fetchAllData(); // Recargamos la información
                } catch (error) { Swal.fire('Error', `No se pudo cancelar la cita.`, 'error'); }
            }
        });
    };

    const citasFiltradas = useMemo(() => {
        return citas.filter(cita => {
            const pasaEstado = filtroEstado ? cita.estado === filtroEstado : true;
            const pasaFecha = filtroFecha ? new Date(cita.fech_cit).toISOString().split('T')[0] === filtroFecha : true;
            return pasaEstado && pasaFecha;
        });
    }, [citas, filtroEstado, filtroFecha]);

    if (view === 'history') {
        return <HistorialView citaId={selectedCitaId} onBack={handleReturnToList} citas={citas} />;
    }

    return (
        <div className="admin-page-content">
            <header className="admin-page-header">
                <h1 className="header-title">Gestión Global de Citas</h1>
                <div className="header-actions">
                    <button className="btn-primary-admin" disabled title="La creación de citas por admin no es posible con la API actual."><FaPlus /> Crear Cita (Deshabilitado)</button>
                </div>
            </header>
            <div className="filters-container">
                 <div className="filter-item"><label>Filtrar por Fecha:</label><input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} /></div>
                 <div className="filter-item"><label>Filtrar por Estado:</label><select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}><option value="">Todos</option><option value="PENDIENTE">Pendiente</option><option value="CONFIRMADA">Confirmada</option><option value="REALIZADA">Realizada</option><option value="CANCELADA">Cancelada</option><option value="NO_ASISTIDA">No Asistida</option></select></div>
                 <button onClick={() => {setFiltroEstado(''); setFiltroFecha('');}} className="btn-secondary">Limpiar</button>
            </div>
            <div className="admin-page-body">
                {loading ? <div className="loading-spinner">Cargando...</div> : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead><tr><th>Fecha y Hora</th><th>Estado</th><th>Propietario</th><th>Mascota</th><th>Veterinario</th><th>Servicio</th><th>Acciones</th></tr></thead>
                            <tbody>{citasFiltradas.map(cita => (
                                <tr key={cita.cod_cit}>
                                    <td>{new Date(cita.fech_cit).toLocaleDateString('es-CO')} {cita.hora}</td><td><span className={`status-badge ${cita.estado?.toLowerCase()}`}>{cita.estado}</span></td>
                                    <td>{cita.propietario}</td><td>{cita.mascota}</td><td>{cita.veterinario}</td><td>{cita.servicio}</td>
                                    <td><div className="actions-cell">
                                        <button onClick={() => handleViewLogs(cita.cod_cit)} className="btn-icon btn-icon-info" title="Ver Historial"><FaHistory /></button>
                                        <button onClick={() => handleOpenEditModal(cita)} className="btn-icon" title="Editar Cita"><FaEdit /></button>
                                        <button onClick={() => handleCancelCita(cita)} className="btn-icon btn-icon-danger" title="Cancelar Cita"><FaTrash /></button>
                                    </div></td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <CitaModalAdmin isOpen={showModal} onClose={() => setShowModal(false)} cita={currentCita} onSave={handleSaveCita} propietarios={propietarios} mascotas={mascotas} veterinarios={veterinarios} servicios={servicios}/>
        </div>
    );
};

export default GestionCitasAdmin;