import { Routes, Route } from "react-router-dom"
import { Suspense, lazy } from "react"

import Login from "../pages/Login.jsx"
import Registrar from "../pages/Registrar.jsx"
import RecuperarContraseña from "../pages/RecuperarContraseña.jsx"
import Header from "../componentes/Header.jsx"
import Footer from "../componentes/Footer.jsx"
import PropietarioDashboard from "../propietario/PropietarioDashboard"
import PrivateRoutePropietario from "./PrivateRoutePropietario"
import AdministradorDashboard from "../administrador/AdministradorDashboard.jsx"
import PrivateRouteAdministrador from "./PrivateRouteAdministrador.jsx"
import VeterinarioDashboard from "../veterinario/VeterinarioDashbord.jsx"
import PrivateRouteVeterinario from "./PrivateRouteVeterinario.jsx"
import Loading from "../pages/Loading.jsx"
import InfoMas from "../propietario/InfoMas.jsx"
import NotFound from "../pages/NotFound.jsx"
import Mascotas from "../propietario/Mascotas.jsx"
import Citas from "../propietario/Citas.jsx"
import Nosotros from "../componentes/Nosotros.jsx"
import CookieBanner from "../pages/Cookies.jsx"
import GestionUsuarios from "../administrador/GestionUsuarios"
import GestionRoles from "../administrador/GestionRoles"
import GestionServicios from "../administrador/GestionServicios"
import GestionCitas from "../veterinario/GestionCitas.jsx"
import MisPacientes from "../veterinario/GestionMascotas.jsx"
import HistorialesMedicos from "../veterinario/HistorialesMedicos.jsx"
import HistorialMedicoPage from "../propietario/Historial.jsx"
import PerfilUsuarioPage from "../propietario/Perfil.jsx"
import GestionCitasAdmin from "../administrador/GestionCitasAdmin.jsx"

const Home = lazy(() => import("../componentes/Home"))

const AppRoutes = () => {
  console.log("AppRoutes renderizado") // Debug

  return (
    <>
      {/* Componente de debug temporal */}

      <Routes>
        {/* Ruta Home con Header y Footer */}
        <Route
          path="/"
          element={
            <Suspense fallback={<Loading fullPage={true} />}>
              <>
                <Header />
                <Home />
                <Footer />
              </>
            </Suspense>
          }
        />

        <Route
          path="/nosotros"
          element={
            <Suspense fallback={<Loading fullPage={true} />}>
              <>
                <Header />
                <Nosotros />
                <Footer />
              </>
            </Suspense>
          }
        />

        {/* Rutas sin Header y Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/recuperar" element={<RecuperarContraseña />} />

        {/* RUTA PRIVADA PARA PROPIETARIOS */}
        <Route element={<PrivateRoutePropietario />}>
          <Route path="/propietario" element={<PropietarioDashboard />} />
          <Route path="/propietario/infomas" element={<InfoMas />} />
          <Route path="/propietario/mascotas" element={<Mascotas />} />
          <Route path="/propietario/citas" element={<Citas />} />
          <Route path="/propietario/historial" element={<HistorialMedicoPage />} />
          <Route path="/propietario/perfil" element={<PerfilUsuarioPage />} />
        </Route>

        {/* RUTAS PRIVADAS PARA ADMINISTRADORES */}
        <Route element={<PrivateRouteAdministrador />}>
          <Route path="/administrador" element={<AdministradorDashboard />}>
            <Route index element={<div />} /> {/* Dashboard principal */}
            <Route path="usuarios" element={<GestionUsuarios />} />
            <Route path="roles" element={<GestionRoles />} />
            <Route path="servicios" element={<GestionServicios />} />
            <Route path="citas" element={<GestionCitasAdmin />} />
          </Route>
        </Route>

        {/* RUTAS PRIVADAS PARA VETERINARIOS */}
        <Route element={<PrivateRouteVeterinario />}>
          <Route path="/veterinario" element={<VeterinarioDashboard />}>
            <Route index element={<div />} /> {/* Ruta por defecto para mostrar el dashboard */}
            <Route path="citas" element={<GestionCitas />} />
            <Route path="pacientes" element={<MisPacientes/>} />
            <Route path="historiales" element={<HistorialesMedicos />} />
          </Route>
        </Route>

        {/* Redirección para rutas no encontradas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieBanner />
    </>
  )
}

export default AppRoutes
