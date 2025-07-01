import { Routes, Route, useParams, Navigate } from "react-router-dom"
import { Suspense, lazy } from "react"
import { Base64 } from "js-base64"

// Importaciones de componentes
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

// --- MANEJADORES DE RUTAS ENCRIPTADAS ---

const PropietarioRouteHandler = () => {
  const { encodedPath } = useParams()
  try {
    const decodedPath = Base64.decode(encodedPath)
    switch (decodedPath) {
      case "infomas": return <InfoMas />
      case "mascotas": return <Mascotas />
      case "citas": return <Citas />
      case "historial": return <HistorialMedicoPage />
      case "perfil": return <PerfilUsuarioPage />
      default: return <NotFound />
    }
  } catch (e) { return <NotFound /> }
}

const AdministradorRouteHandler = () => {
  const { encodedPath } = useParams()
  try {
    const decodedPath = Base64.decode(encodedPath)
    switch (decodedPath) {
      case "usuarios": return <GestionUsuarios />
      case "roles": return <GestionRoles />
      case "servicios": return <GestionServicios />
      case "citas": return <GestionCitasAdmin />
      default: return <NotFound />
    }
  } catch (e) { return <NotFound /> }
}

const VeterinarioRouteHandler = () => {
  const { encodedPath } = useParams()
  try {
    const decodedPath = Base64.decode(encodedPath)
    switch (decodedPath) {
      case "citas": return <GestionCitas />
      case "pacientes": return <MisPacientes />
      case "historiales": return <HistorialesMedicos />
      default: return <NotFound />
    }
  } catch (e) { return <NotFound /> }
}


// --- COMPONENTE PRINCIPAL DE RUTAS ---

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Suspense fallback={<Loading fullPage={true} />}><><Header /><Home /><Footer /></></Suspense>} />
        <Route path="/nosotros" element={<Suspense fallback={<Loading fullPage={true} />}><><Header /><Nosotros /><Footer /></></Suspense>} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/recuperar" element={<RecuperarContraseña />} />

        {/* RUTA PRIVADA PARA PROPIETARIOS (ENCRIPTADA) */}
        <Route element={<PrivateRoutePropietario />}>
          <Route path="/propietario" element={<PropietarioDashboard />} />
          <Route path="/propietario/:encodedPath" element={<PropietarioRouteHandler />} />
        </Route>

        {/* RUTAS PRIVADAS PARA ADMINISTRADORES (ENCRIPTADA) */}
        <Route element={<PrivateRouteAdministrador />}>
          <Route path="/administrador" element={<AdministradorDashboard />}>
            {/* La ruta índice muestra un dashboard principal o un resumen */}
            <Route index element={<div><h4>Panel Principal del Administrador</h4><p>Selecciona una opción del menú para comenzar.</p></div>} />
            <Route path=":encodedPath" element={<AdministradorRouteHandler />} />
          </Route>
        </Route>

        {/* RUTAS PRIVADAS PARA VETERINARIOS (ENCRIPTADA) */}
        <Route element={<PrivateRouteVeterinario />}>
          <Route path="/veterinario" element={<VeterinarioDashboard />}>
             {/* La ruta índice muestra un dashboard principal o un resumen */}
            <Route index element={<div><h4>Panel Principal del Veterinario</h4><p>Selecciona una opción del menú para comenzar.</p></div>} />
            <Route path=":encodedPath" element={<VeterinarioRouteHandler />} />
          </Route>
        </Route>

        {/* Ruta para página no encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieBanner />
    </>
  )
}

export default AppRoutes
