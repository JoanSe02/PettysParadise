import { Link } from "react-router-dom"
import {
  MdArrowForward as IconArrowRight,
  MdPets as IconPets,
  MdCalendarToday as IconCalendar,
  MdLocalHospital as IconMedical,
} from "react-icons/md"
import"../stylos/vet/VetContent.css"
import { Base64 } from "js-base64"
const VetContent = ({ dashboardData, error }) => {
  return (
    <main className="vet-content">
      <div className="dashboard-container">
        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="welcome-content">
            <h1 className="welcome-title">
              ¡Bienvenido de vuelta,
              <br />
              <span className="welcome-name">Dr. {dashboardData.nombre}!</span>
            </h1>
            <p className="welcome-description">
              Gestiona tu práctica veterinaria desde este panel de control. Supervisa citas, pacientes e historiales
              médicos de manera eficiente.
            </p>
          </div>
        </div>

        {/* System Summary Section */}
        <div className="system-summary">
          <div className="section-header">
            <h2 className="section-title">Resumen del Sistema</h2>
            <p className="section-subtitle">Estadísticas principales de tu práctica</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon appointments">
                <IconCalendar size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Citas Programadas</h3>
                <div className="stat-number">{dashboardData.citasProgramadas || 0}</div>
                <p className="stat-description">Citas activas en el sistema</p>
                <Link to={`/veterinario/${Base64.encode("citas")}`} className="stat-link">
                  Gestionar citas <IconArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon patients">
                <IconPets size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Mis Pacientes</h3>
                <div className="stat-number">{dashboardData.pacientes || 0}</div>
                <p className="stat-description">Pacientes bajo tu cuidado</p>
                <Link to={`/veterinario/${Base64.encode("pacientes")}`} className="stat-link">
                  Gestionar pacientes <IconArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon records">
                <IconMedical size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Historiales Médicos</h3>
                <div className="stat-number">{dashboardData.historialesMedicos || 0}</div>
                <p className="stat-description">Registros médicos completos</p>
                <Link to={`/veterinario/${Base64.encode("historiales")}`} className="stat-link">
                  Gestionar historiales <IconArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Acciones Rápidas Mejoradas */}
                      <div className="actions-section">
                        <div className="section-header">
                          <h2>Acciones Rápidas</h2>
                          <p>Tareas veterinarias más comunes</p>
                        </div>
        
                        <div className="actions-grid">
                          <Link to={`/veterinario/${Base64.encode("citas")}`} className="action-card primary">
                            <div className="action-icon">
                              <IconCalendar size={24} />
                            </div>
                            <div className="action-content">
                              <h3>Crear Citas</h3>
                              <p>Agregar nueva cita</p>
                            </div>
                            <div className="action-arrow">
                              <IconArrowRight size={20} />
                            </div>
                          </Link>
        
                          <Link to={`/veterinario/${Base64.encode("mascotas")}`} className="action-card secondary">
                            <div className="action-icon">
                             <IconPets size={24} />
                            </div>
                            <div className="action-content">
                              <h3>Gestiona tus mascotas</h3>
                              <p>Crear mascota</p>
                            </div>
                            <div className="action-arrow">
                              <IconArrowRight size={20} />
                            </div>
                          </Link>
        
                          <Link to={`/veterinario/${Base64.encode("historiales")}`} className="action-card tertiary">
                            <div className="action-icon">
                              <IconMedical size={24} />
                            </div>
                            <div className="action-content">
                              <h3>Historiales Médicos</h3>
                              <p>Registros médicos completos</p>
                            </div>
                            <div className="action-arrow">
                              <IconArrowRight size={20} />
                            </div>
                          </Link>
                        </div>
                      </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default VetContent


