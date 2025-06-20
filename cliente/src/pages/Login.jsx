"use client"
import { useForm } from "react-hook-form"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Link } from "react-router-dom"
import "../stylos/Login.css"
import { FaEye, FaEyeSlash, FaAt, FaLock } from "react-icons/fa"
import { useState, useEffect, useRef } from "react"

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocus, setPasswordFocus] = useState(false)
  const [intentosFallidos, setIntentosFallidos] = useState(0)
  const [cuentaBloqueada, setCuentaBloqueada] = useState(false)
  const [tiempoRestante, setTiempoRestante] = useState(null)
  const [horaDesbloqueo, setHoraDesbloqueo] = useState("")
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  })

  const validateEmail = (value) => {
    if (!value) return "El email es obligatorio"
    if (!value.includes("@")) return "Falta el símbolo @ en el email"
    const parts = value.split("@")
    if (parts.length < 2 || !parts[1]) return "Falta el dominio después del @"
    if (parts[1] && !parts[1].includes(".")) return "Falta el punto (.) en el dominio"
    const pattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
    if (!pattern.test(value)) return "El formato del email no es válido"
    return true
  }

  const validatePassword = (value) => {
    if (!value) return "La contraseña es obligatoria"
    if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres"

    const requirements = []
    if (!/[A-Z]/.test(value)) requirements.push("una mayúscula")
    if (!/[a-z]/.test(value)) requirements.push("una minúscula")
    if (!/[0-9]/.test(value)) requirements.push("un número")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) requirements.push("un carácter especial")

    if (requirements.length > 0) {
      return `La contraseña debe contener ${requirements.join(", ")}`
    }

    return true
  }

  // Función mejorada que usa SOLO los datos del servidor
  const verificarDesbloqueoAutomatico = async (email) => {
    if (!email) return;
  
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/verificar-desbloqueo/${email}`);
  
      if (response.data?.success) {
        if (response.data.auto_desbloqueada || !response.data.cuenta_bloqueada) {
          // Resetear estado local
          setCuentaBloqueada(false);
          setTiempoRestante(null);
          setHoraDesbloqueo("");
  
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
  
          // Mostrar notificación solo si fue auto-desbloqueada
          if (response.data.auto_desbloqueada) {
            Swal.fire({
              icon: "success",
              title: "🔓 Cuenta Desbloqueada",
              text: "Tu cuenta ha sido desbloqueada automáticamente. Ya puedes iniciar sesión.",
              confirmButtonColor: "#28a745",
            });
          }
        } else {
          // Actualizar datos de bloqueo
          setTiempoRestante(response.data.tiempo_restante);
          setHoraDesbloqueo(response.data.hora_desbloqueo);
        }
      }
    } catch (error) {
      console.error("Error verificando desbloqueo:", error);
    }
  };

  // useEffect con verificación cada 10 segundos para mayor precisión
  useEffect(() => {
    const email = watch("email")

    if (cuentaBloqueada && email) {
      // Verificar cada 10 segundos para mayor precisión
      intervalRef.current = setInterval(() => {
        verificarDesbloqueoAutomatico(email)
      }, 10000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }
  }, [cuentaBloqueada, watch("email")])

  // Limpiar intervalo al desmontar componente
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const verificarEstadoCuenta = async (email) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/estado-cuenta/${email}`)
      return response.data
    } catch (error) {
      console.error("Error al verificar estado de cuenta:", error)
      return null
    }
  }

  const onSubmit = async (data) => {
    if (loading) return

    setLoading(true)

    try {

      // Verificar estado de la cuenta antes del login
      const estadoCuenta = await verificarEstadoCuenta(data.email)
      console.log("Respuesta del backend:", estadoCuenta); 
       if (estadoCuenta?.data?.estado === 0) {
        Swal.fire({
          icon: "error",
          title: "🚫 Cuenta Desactivada",
          text: "Tu cuenta se encuentra desactivada. Por favor, contacta al administrador para más detalles.",
          confirmButtonColor: "#dc3545",
          confirmButtonText: "Entendido",
        });
        setLoading(false);
        return; // Detiene la ejecución para no intentar el login
      }

      if (estadoCuenta?.data?.cuenta_bloqueada) {
        // Usar SOLO los datos del servidor, no calcular en frontend
        const tiempoServidor = estadoCuenta.data.tiempo_restante_detallado ||
          estadoCuenta.data.tiempo_restante || { texto: "5 minutos" }

        setCuentaBloqueada(true)
        setTiempoRestante(tiempoServidor)
        setHoraDesbloqueo(estadoCuenta.data.hora_desbloqueo)

        Swal.fire({
          icon: "error",
          title: "🔒 Cuenta Bloqueada",
          html: `
            <div style="text-align: left; margin: 20px 0;">
              <p><strong>Tu cuenta está bloqueada por demasiados intentos fallidos.</strong></p>
              <br>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
                <p><strong>🕐 Se desbloqueará automáticamente:</strong></p>
                <p style="font-size: 18px; color: #dc3545; font-weight: bold;">${estadoCuenta.data.hora_desbloqueo}</p>
                <p><strong>⏱️ Tiempo restante:</strong> ${tiempoServidor.texto}</p>
              </div>
              <br>
              <p style="color: #6c757d;">💡 <em>La página verificará automáticamente cada 10 segundos.</em></p>
            </div>
          `,
          confirmButtonColor: "#dc3545",
          confirmButtonText: "Entendido",
          width: 500,
        })
        setLoading(false)
        return
      }

      // Intentar login
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: data.email,
        contrasena: data.contrasena,
      })

      if (response.data?.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user))
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("id_usuario", response.data.user.id_usuario)

        setIntentosFallidos(0)
        setCuentaBloqueada(false)

        Swal.fire({
          icon: "success",
          title: "¡Bienvenido!",
          text: "Inicio de sesión exitoso",
          timer: 1500,
          showConfirmButton: false,
        })

        const userRole = response.data.user.id_rol
        setTimeout(() => {
          if (userRole === 1) navigate("/administrador")
          else if (userRole === 2) navigate("/veterinario")
          else navigate("/propietario")
        }, 1500)
      }
    } catch (error) {
      console.error("Error en login:", error)

      if (error.response?.status === 401) {
        const intentosRestantes = error.response.data?.intentos_restantes || 0
        setIntentosFallidos((prev) => prev + 1)

        Swal.fire({
          icon: "warning",
          title: "⚠️ Credenciales Incorrectas",
          html: `
            <div style="text-align: center; margin: 20px 0;">
              <p><strong>Correo o contraseña incorrectos</strong></p>
              <br>
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p><strong>⚠️ Intentos restantes:</strong></p>
                <p style="font-size: 24px; color: #856404; font-weight: bold;">${intentosRestantes}</p>
                ${intentosRestantes === 1 ? '<p style="color: #dc3545;"><strong>¡Cuidado! Si fallas una vez más, tu cuenta será bloqueada por 5 minutos.</strong></p>' : ""}
              </div>
            </div>
          `,
          confirmButtonColor: "#ffc107",
          confirmButtonText: "Intentar de nuevo",
        })
      } else if (error.response?.status === 403 && error.response.data?.cuenta_bloqueada) {
        // Usar SOLO datos del servidor
        // En el onSubmit, dentro del catch para error 403
        const tiempoServidor = error.response.data?.tiempo_restante_detallado ||
        error.response.data?.tiempo_restante || { texto: "5 minutos" } // Cambiado de 30 a 5 minutos

        setCuentaBloqueada(true)
        setTiempoRestante(tiempoServidor)
        setHoraDesbloqueo(error.response.data?.hora_desbloqueo)

        Swal.fire({
          icon: "error",
          title: "🚫 Cuenta Bloqueada",
          html: `
            <div style="text-align: left; margin: 20px 0;">
              <p><strong>Tu cuenta ha sido bloqueada temporalmente por 5 minutos.</strong></p>
              <br>
              <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
                <p><strong>🕐 Se desbloqueará automáticamente:</strong></p>
                <p style="font-size: 18px; color: #721c24; font-weight: bold;">${error.response.data?.hora_desbloqueo}</p>
                <p><strong>⏱️ Tiempo restante:</strong> ${tiempoServidor.texto}</p>
              </div>
            </div>
          `,
          confirmButtonColor: "#dc3545",
          confirmButtonText: "Entendido",
          width: 550,
        })
      }
    }

    setLoading(false)
    reset()
  }

  return (
    <main className="login-main">
      <div className="iz-side">
        <div className="logo-container">
          <Link to="/">
            <img
              src="https://raw.githubusercontent.com/Vale250910/mascotas_app1/refs/heads/main/img/logo.png"
              alt="Logo de Akeso"
              className="login-logo"
            />
          </Link>
        </div>
      </div>

      <div className="der-side">
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <h1>Inicia Sesión</h1>

          {cuentaBloqueada && (
            <div className="cuenta-bloqueada-alert">
              <FaLock className="lock-icon" />
              <p>
                Cuenta bloqueada por demasiados intentos fallidos.
                {horaDesbloqueo && horaDesbloqueo !== "undefined" && (
                  <span>
                    <br />
                    <strong>Se desbloqueará el: {horaDesbloqueo}</strong>
                  </span>
                )}
                {tiempoRestante && (
                  <span>
                    <br />
                    <strong>Tiempo restante: {tiempoRestante.texto}</strong>
                  </span>
                )}
                <br />
                <span>💡 Verificando automáticamente cada 10 segundos...</span>
              </p>
            </div>
          )}

          <label>
            <strong>Email</strong>
            <div className="input-icon-container right">
              <input
                type="email"
                {...register("email", {
                  validate: validateEmail,
                })}
                className={`input-icon-field ${errors.email ? "input-error" : ""}`}
                placeholder="ejemplo@dominio.com"
                disabled={loading || cuentaBloqueada}
              />
              <FaAt className="input-icon" />
            </div>
            {errors.email && (
              <p className="error-message1">
                {errors.email.message === "El email es obligatorio" && "Por favor, ingresa tu email"}
                {errors.email.message === "Falta el símbolo @ en el email" &&
                  "El email debe contener un @. Ejemplo: usuario@dominio.com"}
                {errors.email.message === "Falta el dominio después del @" &&
                  "Falta la parte después del @. Ejemplo: usuario@dominio.com"}
                {errors.email.message === "Falta el punto (.) en el dominio del email" &&
                  "El dominio debe contener un punto. Ejemplo: usuario@dominio.com"}
                {errors.email.message === "El formato del email no es válido" &&
                  "El formato del email no es válido. Por favor revisa"}
              </p>
            )}
          </label>

          <label>
            <strong>Contraseña</strong>
            <div className="input-icon-container right">
              <input
                type={showPassword ? "text" : "password"}
                {...register("contrasena", {
                  validate: validatePassword,
                })}
                className={`input-icon-field ${errors.contrasena ? "input-error" : ""}`}
                placeholder="Ingresa tu contraseña"
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                disabled={loading || cuentaBloqueada}
              />
              <span className="toggle-password-icon" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
           
            {errors.contrasena && <p className="error-message1">{errors.contrasena.message}</p>}
          </label>

          <button type="submit" className="login-submit-btn" disabled={cuentaBloqueada || loading}>
            {loading ? "Verificando..." : "Ingresar"}
          </button>

          <div className="extras">
            <p className="signup-link">
              ¿No tienes una cuenta? <Link to="/registrar">Regístrate</Link>
              <br />
              ¿Olvidaste tu contraseña? <Link to="/recuperar">Dale aqui</Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}



