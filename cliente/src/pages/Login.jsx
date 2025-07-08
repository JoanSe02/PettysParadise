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

  useEffect(() => {
    document.title = 'Iniciar Sesión - Petty\'s Paradise'; // Título para la página de inicio
  }, []);

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

  const handleRequestActivation = async (email) => {
    try {
      await axios.post("http://localhost:5000/api/auth/solicitar-activacion", { email });
      Swal.fire({
        icon: "success",
        title: "Solicitud Enviada",
        text: "Se ha notificado al administrador tu solicitud de activación.",
        confirmButtonColor: "#28a745",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar la solicitud. Por favor, inténtalo de nuevo más tarde.",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  const verificarDesbloqueoAutomatico = async (email) => {
    if (!email) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/verificar-desbloqueo/${email}`);
      if (response.data?.success) {
        if (response.data.auto_desbloqueada || !response.data.cuenta_bloqueada) {
          setCuentaBloqueada(false);
          setTiempoRestante(null);
          setHoraDesbloqueo("");
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (response.data.auto_desbloqueada) {
            Swal.fire({
              icon: "success",
              title: "🔓 Cuenta Desbloqueada",
              text: "Tu cuenta ha sido desbloqueada automáticamente. Ya puedes iniciar sesión.",
              confirmButtonColor: "#28a745",
            });
          }
        } else {
          setTiempoRestante(response.data.tiempo_restante);
          setHoraDesbloqueo(response.data.hora_desbloqueo);
        }
      }
    } catch (error) {
      console.error("Error verificando desbloqueo:", error);
    }
  };

  useEffect(() => {
    const email = watch("email")
    if (cuentaBloqueada && email) {
      intervalRef.current = setInterval(() => {
        verificarDesbloqueoAutomatico(email)
      }, 3000); // Intervalo de 3 segundos
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }
  }, [cuentaBloqueada, watch("email")])

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
      const estadoCuenta = await verificarEstadoCuenta(data.email)
      if (estadoCuenta?.data?.estado === 0) {
        Swal.fire({
          icon: "error",
          title: "🚫 Cuenta Desactivada",
          text: "Tu cuenta se encuentra desactivada. ¿Deseas solicitar la activación al administrador?",
          showCancelButton: true,
          confirmButtonText: "Solicitar Activación",
          confirmButtonColor: "#28a745",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            handleRequestActivation(data.email);
          }
        });
        setLoading(false);
        return;
      }
      if (estadoCuenta?.data?.cuenta_bloqueada) {
        const tiempoServidor = estadoCuenta.data.tiempo_restante_detallado || { texto: "20 segundos" }
        setCuentaBloqueada(true)
        setTiempoRestante(tiempoServidor)
        setHoraDesbloqueo(estadoCuenta.data.hora_desbloqueo)
        Swal.fire({
          icon: "error",
          title: "🔒 Cuenta Bloqueada",
          html: `
            <div style="text-align: center; margin: 20px 0;">
              <p>Tu cuenta está bloqueada por demasiados intentos.</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p style="margin: 0;"><strong>⏱️ Tiempo restante para el desbloqueo:</strong></p>
                <p style="font-size: 24px; color: #dc3545; font-weight: bold; margin-top: 5px;">${tiempoServidor.texto}</p>
              </div>
            </div>
          `,
          confirmButtonColor: "#dc3545",
          confirmButtonText: "Entendido",
        })
        setLoading(false)
        return
      }
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
                ${intentosRestantes === 1 ? '<p style="color: #dc3545;"><strong>¡Cuidado! Si fallas una vez más, tu cuenta será bloqueada por 20 segundos.</strong></p>' : ""}
              </div>
            </div>
          `,
          confirmButtonColor: "#ffc107",
          confirmButtonText: "Intentar de nuevo",
        })
      } else if (error.response?.status === 403 && error.response.data?.cuenta_bloqueada) {
        const tiempoServidor = error.response.data?.tiempo_restante_detallado || { texto: "20 segundos" }
        setCuentaBloqueada(true)
        setTiempoRestante(tiempoServidor)
        setHoraDesbloqueo(error.response.data?.hora_desbloqueo)
        Swal.fire({
          icon: "error",
          title: "🚫 Cuenta Bloqueada",
          html: `
            <div style="text-align: center; margin: 20px 0;">
              <p>Has superado el número de intentos permitidos.</p>
              <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p style="margin: 0;"><strong>⏱️ Tu cuenta se desbloqueará en:</strong></p>
                <p style="font-size: 24px; color: #721c24; font-weight: bold; margin-top: 5px;">${tiempoServidor.texto}</p>
              </div>
            </div>
          `,
          confirmButtonColor: "#dc3545",
          confirmButtonText: "Entendido",
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
                {tiempoRestante && (
                  <span>
                    <br />
                    <strong>Tiempo restante: {tiempoRestante.texto}</strong>
                  </span>
                )}
                <br />
                
              </p>
            </div>
          )}
          <label>
            <strong>Email</strong>
            <div className="input-icon-container right">
              <input
                type="email"
                {...register("email", { validate: validateEmail })}
                className={`input-icon-field ${errors.email ? "input-error" : ""}`}
                placeholder="ejemplo@dominio.com"
                disabled={loading || cuentaBloqueada}
              />
              <FaAt className="input-icon" />
            </div>
            {errors.email && <p className="error-message1">{errors.email.message}</p>}
          </label>
          <label>
            <strong>Contraseña</strong>
            <div className="input-icon-container right">
              <input
                type={showPassword ? "text" : "password"}
                {...register("contrasena", { validate: validatePassword })}
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