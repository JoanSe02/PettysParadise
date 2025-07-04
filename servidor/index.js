const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
const encriptarContrasenas = require('./encrypt'); 
const JWT_SECRET = process.env.JWT_SECRET;
const path = require('path');
if (!JWT_SECRET) {  console.error("FATAL ERROR: La variable de entorno JWT_SECRET no está definida.");  process.exit(1); }

// Middlewares
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Middleware para log de peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Importar rutas
const authRoutes = require("./routes/auth");
const mascotasRoutes = require("./routes/mascota");
const citasRoutes = require("./routes/citas");
const passwordRoutes = require("./routes/password");
const rolesRoutes = require("./routes/roles");
const serviciosRoutes = require("./routes/servicios");
const verMasRoutes = require("./routes/vermas");
const uploadRoutes = require('./routes/upload');
const historialesRoutes = require("./routes/historialesvet");
const perfilRoutes = require("./routes/perfil");
const historialRoutes = require('./routes/historial');
const logsRoutes = require('./routes/logs');
const adminCitasRoutes = require('./routes/admin_citas');
const userRoutes = require('./routes/users');

// Usar rutas con prefijos
app.use("/api/auth", authRoutes);
app.use("/api/mascota", mascotasRoutes);
app.use('/api/admin/citas', adminCitasRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/vermas", verMasRoutes);
app.use('/api/upload', uploadRoutes);
app.use("/api/historiales", historialesRoutes);
app.use('/api/historial', historialRoutes);
app.use("/api/perfil", perfilRoutes);
app.use('/api/logs', logsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/citas/admin', adminCitasRoutes);
app.use('/api/users', userRoutes); 





app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando' });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor
async function startServer() {
  try {
    // Ejecutar encriptación solo si se especifica el flag --encrypt
    if (process.argv.includes('--encrypt')) {
      console.log("Iniciando proceso de encriptación de contraseñas...");
      await encriptarContrasenas();
      console.log("Proceso de encriptación completado.");
    }

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();
