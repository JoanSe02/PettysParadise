"use client"

import { Link } from "react-router-dom"
import {
  MdArrowForward as IconArrowRight,
  MdAdd as IconPlus,
  MdPets as IconPets,
  MdCalendarToday as IconCalendar,
  MdAssignment as IconAssignment,
  MdLocalHospital as IconMedical,
} from "react-icons/md"

const VetContent = ({ dashboardData, error }) => {
  return (
    <main className="vet-content">
      <div className="dashboard-summary">
        <div className="welcome-section">
          <h2>Bienvenido, Dr. {dashboardData.nombre}</h2>
          <p className="welcome-message">
            Panel de control veterinario de Petty's Paradise. Gestiona tus citas, pacientes e historiales médicos.
          </p>
        </div>

        <div className="vet-stats-grid">
          <div className="vet-stat-card appointments">
            <IconCalendar className="vet-stat-icon primary" size={32} />
            <div className="vet-stat-content">
              <h3>Citas programadas</h3>
              <p className="vet-stat-value">{dashboardData.citasProgramadas}</p>
              <Link to="/veterinario/citas" className="card-link">
                Ver calendario <IconArrowRight />
              </Link>
            </div>
          </div>

          <div className="vet-stat-card patients">
            <IconPets className="vet-stat-icon secondary" size={32} />
            <div className="vet-stat-content">
              <h3>Pacientes</h3>
              <p className="vet-stat-value">{dashboardData.pacientes}</p>
              <Link to="/veterinario/pacientes" className="card-link">
                Gestionar pacientes <IconArrowRight />
              </Link>
            </div>
          </div>

          <div className="vet-stat-card records">
            <IconMedical className="vet-stat-icon tertiary" size={32} />
            <div className="vet-stat-content">
              <h3>Historiales médicos</h3>
              <p className="vet-stat-value">{dashboardData.historialesMedicos}</p>
              <Link to="/veterinario/historiales" className="card-link">
                Revisar historiales <IconArrowRight />
              </Link>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Acciones Rápidas</h3>
          <div className="action-buttons">
            <Link to="/veterinario/citas" className="vet-btn vet-btn-primary">
              <IconPlus /> Agendar nueva cita
            </Link>
            <Link to="/veterinario/pacientes" className="vet-btn vet-btn-secondary">
              <IconPets /> Registrar paciente
            </Link>
            <Link to="/veterinario/historiales" className="vet-btn vet-btn-secondary">
              <IconAssignment /> Crear historial
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