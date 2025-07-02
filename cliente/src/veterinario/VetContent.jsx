import { Link } from "react-router-dom"
import {
  MdArrowForward as IconArrowRight,
  MdPets as IconPets,
  MdCalendarToday as IconCalendar,
  MdLocalHospital as IconMedical,
  MdTrendingUp as IconTrending,
  MdNotifications as IconNotifications,
} from "react-icons/md"
import { Base64 } from "js-base64"
import "../stylos/vet/VetContent.css"

const VetContent = ({ dashboardData, error }) => {
  return (
    <main className="vet-content">
      <div className="dashboard-container">
        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="welcome-content">
            <div className="welcome-header">
              
            </div>

            <h1 className="welcome-title">
              ¡Bienvenido de vuelta,
              <br />
              <span className="welcome-name">Dr. {dashboardData.nombre}!</span>
            </h1>

            <p className="welcome-description">
              Gestiona tu práctica veterinaria desde este panel de control. Supervisa citas, pacientes e historiales
              médicos de manera eficiente y profesional.
            </p>
          </div>
        </div>

        {/* System Summary Section */}
        <div className="system-summary">
          

          <div className="section-content">
            <div className="stats-grid">
              {/* Citas Programadas */}
              <div className="stat-card appointments">
                <div className="stat-card-content5">
                  <div className="stat-icon appointments">
                    <IconCalendar />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-label">Citas Programadas</h3>
                    <div className="stat-number">{dashboardData.citasProgramadas || 0}</div>
                    <p className="stat-description">Citas activas en el sistema</p>
                    <Link to={`/veterinario/${Base64.encode("citas")}`} className="stat-link">
                      Gestionar citas <IconArrowRight />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mis Pacientes */}
              <div className="stat-card patients">
                <div className="stat-card-content">
                  <div className="stat-icon patients">
                    <IconPets />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-label">Mis Pacientes</h3>
                    <div className="stat-number">{dashboardData.pacientes || 0}</div>
                    <p className="stat-description">Pacientes bajo tu cuidado</p>
                    <Link to={`/veterinario/${Base64.encode("pacientes")}`} className="stat-link">
                      Gestionar pacientes <IconArrowRight />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Historiales Médicos */}
              <div className="stat-card records">
                <div className="stat-card-content">
                  <div className="stat-icon records">
                    <IconMedical />
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-label">Historiales Médicos</h3>
                    <div className="stat-number">{dashboardData.historialesMedicos || 0}</div>
                    <p className="stat-description">Registros médicos completos</p>
                    <Link to={`/veterinario/${Base64.encode("historiales")}`} className="stat-link">
                      Gestionar historiales <IconArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="actions-section">
          <div className="actions-header">
            <h2 className="actions-title">Acciones Rápidas</h2>
            <p className="actions-subtitle">Tareas veterinarias más comunes para optimizar tu flujo de trabajo</p>
          </div>

          <div className="actions-grid">
            {/* Crear Citas */}
            <Link to={`/veterinario/${Base64.encode("citas")}`} className="action-card primary">
              <div className="action-card-content">
                <div className="action-icon">
                  <IconCalendar />
                </div>
                <div className="action-info">
                  <h3 className="action-title">Crear Citas</h3>
                  <p className="action-description">Programar nueva cita médica</p>
                </div>
                <div className="action-arrow">
                  <IconArrowRight />
                </div>
              </div>
            </Link>

            {/* Gestionar Mascotas */}
            <Link to={`/veterinario/${Base64.encode("mascotas")}`} className="action-card secondary">
              <div className="action-card-content">
                <div className="action-icon">
                  <IconPets />
                </div>
                <div className="action-info">
                  <h3 className="action-title">Gestionar Mascotas</h3>
                  <p className="action-description">Registrar nueva mascota</p>
                </div>
                <div className="action-arrow">
                  <IconArrowRight />
                </div>
              </div>
            </Link>

            {/* Historiales Médicos */}
            <Link to={`/veterinario/${Base64.encode("historiales")}`} className="action-card tertiary">
              <div className="action-card-content">
                <div className="action-icon">
                  <IconMedical />
                </div>
                <div className="action-info">
                  <h3 className="action-title">Historiales Médicos</h3>
                  <p className="action-description">Consultar registros médicos</p>
                </div>
                <div className="action-arrow">
                  <IconArrowRight />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <div className="error-content">
              <div className="error-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="error-title">Error en el sistema</h3>
                <p className="error-text">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default VetContent
