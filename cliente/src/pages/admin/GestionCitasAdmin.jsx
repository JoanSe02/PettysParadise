// RUTA: cliente/src/pages/admin/GestionCitasAdmin.jsx

import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api-service';
import Swal from 'sweetalert2';
import { FaCalendarAlt, FaHistory, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import '../../stylos/Admin/GestionCitasAdmin.css';

// ¡YA NO SE IMPORTAN HEADER NI SIDEBAR!
// Este componente ahora solo renderiza el contenido principal.

const GestionCitasAdmin = () => {
    const [view, setView] = useState('citas');
    const [citas, setCitas] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loadingCitas, setLoadingCitas] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);

    useEffect(() => {
        fetchCitasAdmin();
        fetchLogs();
    }, []);

    const fetchCitasAdmin = async () => {
        setLoadingCitas(true);
        try {
            const data = await apiService.get("/api/citas/admin/todas");
            setCitas(data);
        } catch (error) {
            Swal.fire('Error', 'No se pudieron cargar las citas.', 'error');
        } finally {
            setLoadingCitas(false);
        }
    };

    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            const data = await apiService.get('/api/logs/citas');
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const CitasView = () => (
        loadingCitas ? <div className="loading-spinner">Cargando citas...</div> :
        <div className="table-container">
            <table className="data-table">
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
                    {citas.map(cita => (
                        <tr key={cita.cod_cit}>
                            <td>{new Date(cita.fech_cit).toLocaleDateString('es-CO')} {cita.hora}</td>
                            <td><span className={`status-badge ${cita.estado?.toLowerCase()}`}>{cita.estado}</span></td>
                            <td>{cita.propietario}</td>
                            <td>{cita.mascota}</td>
                            <td>{cita.veterinario}</td>
                            <td>{cita.servicio}</td>
                            <td>
                                <div className="actions-cell">
                                    <button className="btn-icon" title="Ver Detalles"><FaEye /></button>
                                    <button className="btn-icon" title="Editar Cita"><FaEdit /></button>
                                    <button className="btn-icon btn-icon-danger" title="Cancelar Cita"><FaTrash /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const LogsView = () => (
        loadingLogs ? <div className="loading-spinner">Cargando logs...</div> :
        <div className="table-container">
            <table className="data-table logs-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Cita ID</th>
                        <th>Usuario Modificador</th>
                        <th>Rol</th>
                        <th>Acción</th>
                        <th>Detalles Anteriores</th>
                        <th>Detalles Nuevos</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.log_id}>
                            <td>{new Date(log.fecha_modificacion).toLocaleString('es-CO')}</td>
                            <td>{log.cita_id}</td>
                            <td>{log.nombre_usuario || 'N/A'} (ID: {log.id_usuario_modificador})</td>
                            <td>{log.rol_usuario || 'N/A'}</td>
                            <td><span className={`action-badge ${log.accion_realizada?.toLowerCase()}`}>{log.accion_realizada}</span></td>
                            <td className="details-cell"><pre>{log.detalles_anteriores}</pre></td>
                            <td className="details-cell"><pre>{log.detalles_nuevos}</pre></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        // El componente ahora retorna directamente el contenedor del contenido principal
        <div className="admin-page-content">
            <header className="admin-page-header">
                <h1 className="header-title">Gestión de Citas y Auditoría</h1>
                <div className="view-toggle">
                    <button onClick={() => setView('citas')} className={`toggle-btn ${view === 'citas' ? 'active' : ''}`}>
                        <FaCalendarAlt /> Gestión de Citas
                    </button>
                    <button onClick={() => setView('logs')} className={`toggle-btn ${view === 'logs' ? 'active' : ''}`}>
                        <FaHistory /> Ver Logs
                    </button>
                </div>
            </header>
            <div className="admin-page-body">
                {view === 'citas' ? <CitasView /> : <LogsView />}
            </div>
        </div>
    );
};

export default GestionCitasAdmin;