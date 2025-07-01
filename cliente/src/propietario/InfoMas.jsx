import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Search,
  Eye,
  PawPrint,
  Weight,
  Cake,
  Venus,
  Mars,
  X,
  Plus,
  MapPin,
  Phone,
  Mail,
  User,
  Save,
  Upload,
  Dog,
  Award,
  Calendar,
  CreditCard,
  UserIcon as Male,
  UserIcon as Female,
} from "lucide-react"
import { FaPaw } from "react-icons/fa"
import HeaderSir from "../propietario/HeaderSir"
import Dashbord from "../propietario/Dashbord"
import axios from "axios"
import Swal from "sweetalert2"
import "../stylos/Pro/InfoMas.css"
import "../stylos/vet/Mascotas.css"

const InfoMas = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMascota, setSelectedMascota] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    ciudad: "",
    direccion: "",
    id: null,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
  defaultValues: {
    nom_mas: "",
    especie: "",
    raza: "",
    genero: null,
    edad: 5,
    peso: 5,
    
  }
});

  const API_URL = "http://localhost:5000"

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const fetchMascotas = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }
      const response = await axios.get(`${API_URL}/api/vermas/mascotas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setMascotas(response.data)
    } catch (err) {
      console.error("Error fetching mascotas:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setUserData({
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      email: user.email || "",
      telefono: user.telefono || "",
      ciudad: user.ciudad || "",
      direccion: user.direccion || "",
      id: user.id_usuario || null,
    })
    fetchMascotas()
  }, [])

  // --- CAMBIO 1: Función para abrir el modal y resetear el formulario ---
  const handleOpenAddModal = () => {
    reset({
      // Resetea los campos a sus valores por defecto
      nom_mas: "",
      especie: "",
      raza: "",
      genero: null,
      // Establece los valores fijos y del propietario
      edad: 5,
      peso: 5,
      id_pro: userData.id,
    });
    // Limpia la previsualización de la imagen
    setImagePreview(null);
    setImageUrl(null);
    // Muestra el modal
    setShowAddModal(true);
  };

  const filteredMascotas = mascotas.filter((mascota) =>
    mascota.nom_mas && searchTerm ? mascota.nom_mas.toLowerCase().includes(searchTerm.toLowerCase()) : true,
  )

  const handleViewDetails = (mascota) => {
    setSelectedMascota(mascota)
    setShowDetailsModal(true)
  }

  const checkServerHealth = async () => {
    try {
      await axios.get("http://localhost:5000/api/health", { timeout: 5000 })
      return true
    } catch (error) {
      return false
    }
  }

  const uploadImageToCloudinary = async (file) => {
    setUploading(true)
    try {
      const serverOk = await checkServerHealth()
      if (!serverOk) {
        throw new Error("El servidor no está disponible. Verifica que esté ejecutándose en el puerto 5000.")
      }
      const formData = new FormData()
      formData.append("file", file)
      const response = await axios.post("http://localhost:5000/api/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      })
      if (response.data.success && response.data.url) {
        setImageUrl(response.data.url)
        Swal.fire({
          icon: "success",
          title: "¡Imagen subida!",
          text: "La foto se ha cargado correctamente.",
          timer: 2000,
          showConfirmButton: false,
        })
        return response.data.url
      } else {
        throw new Error("Respuesta del servidor inválida.")
      }
    } catch (error) {
      let errorMessage = "Error desconocido al subir la imagen."
      if (error.code === 'ECONNABORTED') {
          errorMessage = "Tiempo de espera agotado. La imagen puede ser muy grande o la conexión es lenta."
      } else if (error.code === 'ECONNREFUSED') {
          errorMessage = "No se pudo conectar con el servidor. Verifica que esté ejecutándose en el puerto 5000."
      } else if (error.response) {
          errorMessage = error.response.data.error || `Error del servidor (${error.response.status})`
      } else if (error.message) {
          errorMessage = error.message
      }
      Swal.fire({
        icon: "warning",
        title: "Error al subir imagen",
        html: `<p>${errorMessage}</p><br><small>Puedes intentar de nuevo.</small>`,
        confirmButtonText: "Entendido",
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      Swal.fire({ icon: "error", title: "Formato no válido", text: "Solo se permiten archivos JPG, PNG o WebP." })
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      Swal.fire({ icon: "error", title: "Archivo muy grande", text: `La imagen debe ser menor a 5MB.` })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)

    await uploadImageToCloudinary(file)
  }

  const handleAddMascota = async (data) => {
    if (!imageUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'Foto requerida',
        text: 'Por favor, sube una foto de la mascota antes de guardar.',
      })
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No se encontró token de autenticación")
      }
      
        const mascotaData = {
        nom_mas: data.nom_mas,
        especie: data.especie,
        genero: data.genero,
        raza: data.raza,
        edad: Number.parseInt(data.edad),
        peso: Number.parseFloat(data.peso),
        id_pro: userData.id, // Correcto: Accede a la propiedad 'id' del estado userData
        foto: imageUrl,
      }
      console.log("Enviando estos datos al servidor:", mascotaData); 
      const response = await axios.post(`${API_URL}/api/mascota/create`, mascotaData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      setMascotas((prev) => [...prev, response.data])
      setShowAddModal(false) // Cierra el modal al tener éxito

      Swal.fire({
          icon: 'success',
          title: '¡Mascota agregada exitosamente!',
          showConfirmButton: false,
          timer: 1500
      })
    } catch (error) {
      console.error("Error al agregar mascota:", error)
      Swal.fire({
          icon: 'error',
          title: 'Error al agregar la mascota',
          text: error.response?.data?.message || 'Por favor intenta nuevamente.'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <HeaderSir onToggleSidebar={toggleSidebar} />
        <Dashbord isOpen={sidebarOpen} />
        <main className="main-content4">
          
          
          
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-container1">
      <HeaderSir onToggleSidebar={toggleSidebar} />
      <Dashbord isOpen={sidebarOpen} />

      <main className="main-content4">
        <header className="content-header">
          <div className="page-header">
            <div className="header-title-container">
              <div className="header-icon1">
                <FaPaw className="icon-white" />
              </div>
              <div>
                <h1 className="header-title1">Mis Mascotas</h1>
                <p className="header-subtitle">Administra la información de tus compañeros peludos</p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar mascota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                whiteSpace: "nowrap",
              }}
            >
              <Plus size={16} />
              Agregar Mascota
            </button>
          </div>
        </header>

        <div className="content-body">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header1">
                <div className="stat-icon">
                  <PawPrint size={24} />
                </div>
                <div className="stat-value">{mascotas.length}</div>
              </div>
              <div className="stat-label">Mascotas Registradas</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: "#ec4899" }}>
                  <Venus size={24} />
                </div>
                <div className="stat-value">{mascotas.filter((m) => m.genero === "Hembra").length}</div>
              </div>
              <div className="stat-label">Hembras</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: "#3b82f6" }}>
                  <Mars size={24} />
                </div>
                <div className="stat-value">{mascotas.filter((m) => m.genero === "Macho").length}</div>
              </div>
              <div className="stat-label">Machos</div>
            </div>
          </div>

          {mascotas.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 2rem",
                textAlign: "center",
                background: "white",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "#2563eb",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  color: "white",
                }}
              >
                <PawPrint size={40} />
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.75rem" }}>
                ¡Aún no tienes mascotas registradas!
              </h3>
              <p style={{ color: "#6b7280", marginBottom: "2rem", maxWidth: "400px" }}>
                Agrega tu primera mascota completando el formulario de registro.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                }}
              >
                <Plus size={16} />
                Agregar Mi Primera Mascota
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {filteredMascotas.map((mascota) => {
                return (
                  <div key={mascota.id} className="card">
                    <div className="card-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: `url(${mascota.foto || "/placeholder.svg?height=60&width=60"}) center/cover`,
                            border: "3px solid #e5e7eb",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-2px",
                              right: "-2px",
                              width: "20px",
                              height: "20px",
                              background: mascota.genero === "Macho" ? "#3b82f6" : "#ec4899",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "0.75rem",
                            }}
                          >
                            {mascota.genero === "Macho" ? <Mars size={12} /> : <Venus size={12} />}
                          </div>
                        </div>
                        <div>
                          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                            {mascota.nom_mas || "Sin nombre"}
                          </h3>
                          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                            {mascota.especie || "Especie no especificada"} • {mascota.raza || "Raza no especificada"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                        <span
                          style={{
                            background: "#f3f4f6",
                            padding: "0.375rem 0.75rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                          }}
                        >
                          <Cake size={12} />
                          {Number.parseFloat(mascota.edad || 0).toString()} años
                        </span>
                        <span
                          style={{
                            background: "#f3f4f6",
                            padding: "0.375rem 0.75rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                          }}
                        >
                          <Weight size={12} />
                          {Number.parseFloat(mascota.peso || 0).toString()} kg
                        </span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.875rem",
                            color: "#6b7280",
                          }}
                        >
                          <User size={14} />
                          <span>
                            Propietario: {userData.nombre} {userData.apellido}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.875rem",
                            color: "#6b7280",
                          }}
                        >
                          <MapPin size={14} />
                          <span>{userData.ciudad}</span>
                        </div>
                      </div>

                      <div
                        style={{
                          background: "#f9fafb",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                          color: "#4b5563",
                        }}
                      >
                        <strong> Género:</strong> {mascota.genero}
                      </div>
                    </div>

                    <div className="card-footer">
                      <button
                        onClick={() => handleViewDetails(mascota)}
                        className="btn-primary"
                        style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                      >
                        <Eye size={14} />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal para agregar mascota - NUEVO FORMULARIO */}
       {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "0",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1.5rem",
                background: "linear-gradient(rgb(14, 142, 221) 0%, rgb(21, 76, 112) 100%)",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PawPrint size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "600", margin: 0 }}>Agregar Nueva Mascota</h2>
                  <p style={{ opacity: 0.9, margin: 0, fontSize: "0.875rem" }}>Completa la información de tu mascota</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  reset()
                  setImagePreview(null)
                  setImageUrl(null)
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderRadius: "0.25rem",
                  color: "white",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleAddMascota)} style={{ padding: "1.5rem", maxHeight: "70vh", overflow: "auto" }}>
              <div className="image-upload-container">
                <label htmlFor="file-upload" className="image-upload-label">
                  <div className="image-preview">
                    {imagePreview ? (
                      <img src={imagePreview || "/placeholder.svg"} alt="Foto de la mascota" />
                    ) : (
                      <div className="upload-placeholder">
                        <Upload className="upload-icon" />
                        <span>Subir foto (opcional)</span>
                      </div>
                    )}
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                {uploading && <p className="uploading-text">Subiendo imagen...</p>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User className="field-icon" />
                  <span>Nombre</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre de tu mascota"
                  {...register("nom_mas", {
                    required: "El nombre es obligatorio",
                    minLength: { value: 2, message: "Debe tener al menos 2 caracteres" },
                    maxLength: { value: 50, message: "Máximo 50 caracteres" },
                  })}
                />
                {errors.nom_mas && <p className="error-message3">{errors.nom_mas.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Dog className="field-icon" />
                  <span>Especie</span>
                </label>
                <select
                  className="form-input"
                  {...register("especie", {
                    required: "La especie es obligatoria",
                  })}
                >
                  <option value="">Selecciona una especie</option>
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                </select>
                {errors.especie && <p className="error-message3">{errors.especie.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Male className="field-icon" />
                  <span>Género</span>
                </label>
                <div className="gender-options">
                  <label className="gender-option">
                    <input
                      type="radio"
                      value="Macho"
                      {...register("genero", {
                        required: "El género es obligatorio",
                      })}
                    />
                    <div className="gender-radio-button">
                      <Mars className="gender-icon male-icon" />
                      <span>Macho</span>
                    </div>
                  </label>
                  <label className="gender-option">
                    <input
                      type="radio"
                      value="Hembra"
                      {...register("genero", {
                        required: "El género es obligatorio",
                      })}
                    />
                    <div className="gender-radio-button">
                      <Venus className="gender-icon female-icon" />
                      <span>Hembra</span>
                    </div>
                  </label>
                </div>
                {errors.genero && <p className="error-message3">{errors.genero.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Award className="field-icon" />
                  <span>Raza</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Raza de tu mascota"
                  {...register("raza", {
                    required: "La raza es obligatoria",
                    maxLength: { value: 50, message: "Máximo 50 caracteres" },
                  })}
                />
                {errors.raza && <p className="error-message3">{errors.raza.message}</p>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Calendar className="field-icon" />
                    <span>Edad (años)</span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    readOnly
                    {...register("edad")}
                  />
                  {errors.edad && <p className="error-message3">{errors.edad.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Weight className="field-icon" />
                    <span>Peso (kg)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    readOnly
                    {...register("peso")}
                  />
                  {errors.peso && <p className="error-message3">{errors.peso.message}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User className="field-icon" />
                  <span>Propietario</span>
                </label>
                <select
                  className="form-input"
                  disabled
                  {...register("id_pro", { required: true })}
                  value={userData.id || ""} // <- asegura que se muestre el nombre
                >
                  <option value={userData.id}>
                    {userData.nombre} {userData.apellido}
                  </option>
                </select>

                {errors.id_pro && <p className="error-message3">{errors.id_pro.message}</p>}
              </div>
              

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    reset()
                    setImagePreview(null)
                    setImageUrl(null)
                  }}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "1px solid #d1d5db",
                    background: "white",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                  disabled={saving || uploading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: (saving || uploading) ? "#9ca3af" : "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: (saving || uploading) ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {saving ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid transparent",
                          borderTop: "2px solid white",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Guardando...
                    </>
                  ) : uploading ? (
                    "Subiendo imagen..."
                  ) : (
                    <>
                      <Save size={16} />
                      Agregar Mascota
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailsModal && selectedMascota && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.75rem",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            {/* Header del modal */}
            <div
              style={{
                padding: "1.5rem",
                borderBottom: "1px solid #e5e7eb",
                background: "linear-gradient(rgb(14, 142, 221) 0%, rgb(21, 76, 112) 100%)",
                color: "white",
                borderRadius: "0.75rem 0.75rem 0 0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: `url(${selectedMascota.foto || "/placeholder.svg?height=60&width=60"}) center/cover`,
                      border: "3px solid rgba(255, 255, 255, 0.3)",
                    }}
                  />
                  <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "600", margin: 0 }}>{selectedMascota.nom_mas}</h2>
                    <p style={{ opacity: 0.9, margin: 0 }}>
                      {selectedMascota.especie} • {selectedMascota.raza}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.5rem",
                    borderRadius: "0.25rem",
                    color: "white",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div style={{ padding: "1.5rem" }}>
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}
              >
                {/* Información básica */}
                <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "0.5rem" }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <PawPrint size={18} />
                    Información Básica
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Cake size={16} color="#6b7280" />
                      <span>
                        <strong>Edad:</strong> {Number.parseFloat(selectedMascota.edad || 0)} años
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Weight size={16} color="#6b7280" />
                      <span>
                        <strong>Peso:</strong> {Number.parseFloat(selectedMascota.peso || 0)} kg
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {selectedMascota.genero === "Macho" ? (
                        <Mars size={16} color="#3b82f6" />
                      ) : (
                        <Venus size={16} color="#ec4899" />
                      )}
                      <span>
                        <strong>Género:</strong> {selectedMascota.genero}
                      </span>
                    </div>
                    {selectedMascota.color && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: "#6b7280",
                          }}
                        />
                        <span>
                          <strong>Color:</strong> {selectedMascota.color}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información del propietario */}
                <div style={{ background: "#f0f4ff", padding: "1rem", borderRadius: "0.5rem" }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <User size={18} />
                    Propietario
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <User size={16} color="#6b7280" />
                      <span>
                        <strong>Nombre:</strong> {userData.nombre} {userData.apellido}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Mail size={16} color="#6b7280" />
                      <span>
                        <strong>Email:</strong> {userData.email}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Phone size={16} color="#6b7280" />
                      <span>
                        <strong>Teléfono:</strong> {userData.telefono}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <MapPin size={16} color="#6b7280" />
                      <span>
                        <strong>Ubicación:</strong> {userData.ciudad}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción adicional */}
              {selectedMascota.descripcion && (
                <div style={{ marginTop: "1.5rem", background: "#f9fafb", padding: "1rem", borderRadius: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>Descripción</h3>
                  <p style={{ color: "#6b7280", lineHeight: "1.5" }}>{selectedMascota.descripcion}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button onClick={() => setShowDetailsModal(false)} className="btn-secondary">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default InfoMas










