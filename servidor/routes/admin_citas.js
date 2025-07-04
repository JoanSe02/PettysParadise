const express = require("express");
const router = express.Router();
const pool = require("../db/conexion");
const authenticateToken = require("../middlewares/authenticateToken");

const isAdmin = (req, res, next) => {
    if (req.user.id_rol !== 1) { 
        return res.status(403).json({ success: false, message: "Acceso denegado. Se requiere rol de administrador." });
    }
    next();
};


// --- NUEVOS ENDPOINTS SEGUROS PARA ADMIN ---
router.get('/todas', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.cod_cit, c.fech_cit, c.hora, c.est_cit, c.notas,
                c.id_pro, c.cod_mas, c.cod_ser, c.id_vet,
                CONCAT(u_pro.nombre, ' ', u_pro.apellido) AS propietario,
                m.nom_mas AS mascota,
                s.nom_ser AS servicio,
                CONCAT(u_vet.nombre, ' ', u_vet.apellido) AS veterinario
            FROM citas c
            LEFT JOIN propietarios p ON c.id_pro = p.id_pro
            LEFT JOIN usuarios u_pro ON p.id_pro = u_pro.id_usuario
            LEFT JOIN mascotas m ON c.cod_mas = m.cod_mas
            LEFT JOIN servicios s ON c.cod_ser = s.cod_ser
            LEFT JOIN veterinarios v ON c.id_vet = v.id_vet
            LEFT JOIN usuarios u_vet ON v.id_vet = u_vet.id_usuario
            ORDER BY c.fech_cit DESC, c.hora DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener todas las citas para admin:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor al consultar las citas." });
    }
});
// Crear Cita


router.post("/", authenticateToken, isAdmin, async (req, res) => {
    let connection;
    try {
        const { fech_cit, hora, cod_ser, id_vet, cod_mas, id_pro, notas } = req.body;
        connection = await pool.getConnection();
        await connection.query("CALL InsertarCita(?, ?, ?, ?, ?, ?, ?, @new_cita_id)", 
            [fech_cit, hora, cod_ser, id_vet, cod_mas, id_pro, notas]
        );
        res.status(201).json({ success: true, message: "Cita creada exitosamente." });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error en el servidor al crear la cita: ${error.message}` });
    } finally {
        if (connection) connection.release();
    }
});
// ... dentro de admin_citas.js


router.put("/:cod_cit/act", authenticateToken, async (req, res) => {
    let connection;
    try {
      // 1. OBTENER CONEXIÓN DE LA BASE DE DATOS
      connection = await pool.getConnection();
      await connection.beginTransaction(); // Iniciar transacción
  
      const { cod_cit } = req.params;
      const { id_usuario } = req.user; // Obtienes el ID del usuario logueado
  
      // Obtener los datos del cuerpo de la solicitud
      const { cod_mas, cod_ser, id_vet, fech_cit, hora, est_cit, notas } = req.body;
  
      // 2. LLAMAR AL PROCEDIMIENTO PARA ACTUALIZAR LA CITA
      await connection.query(`CALL ActualizarCita(?, ?, ?, ?, ?, ?, ?, ?)`, [
        cod_cit, fech_cit, hora, cod_ser, id_vet, cod_mas, est_cit, notas,
      ]);
  
      // 3. REGISTRAR EL CAMBIO EN EL LOG
      const descripcionLog = `La cita fue actualizada. Nuevo estado: ${est_cit}, Nueva fecha: ${fech_cit}, Nueva hora: ${hora}.`;
      await connection.query("CALL RegistrarLogCita(?, ?, ?, ?)", [
          cod_cit, 
          'UPDATE', 
          descripcionLog, 
          id_usuario 
      ]);
  
      // 4. CONFIRMAR LA TRANSACCIÓN
      await connection.commit();
  
      res.json({ success: true, message: "Cita actualizada exitosamente" });
  
    } catch (error) {
      // Si algo falla, revertir los cambios
      if (connection) await connection.rollback();
      console.error("Error al actualizar la cita:", error); // Es buena idea registrar el error
      res.status(500).json({ success: false, message: "Error en el servidor al actualizar la cita." });
  
    } finally {
      // 5. LIBERAR LA CONEXIÓN
      if (connection) connection.release();
    }
  });
// Cancelar Cita
router.put('/:cod_cit/cancelar', authenticateToken, isAdmin, async (req, res) => {
    const { cod_cit } = req.params;
    try {
        // ----> ¡EL ERROR OCURRE AQUÍ! <----
        await pool.query("CALL CancelarCita(?)", [cod_cit]);
        
        await registrarLog(cod_cit, 'CANCEL', `Admin canceló la cita.`, req.user.id_usuario);
        res.json({ success: true, message: "Cita cancelada." });
    } catch (error) { 
        // El error en la base de datos activa este bloque y envía la respuesta 500
        res.status(500).json({ success: false, message: "Error al cancelar la cita." }); 
    }
});

router.get('/:cod_cit/logs', authenticateToken, isAdmin, async (req, res) => {
    const { cod_cit } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        const [logs] = await connection.query("CALL ObtenerLogsPorCita(?)", [cod_cit]);
        res.json(logs[0] || []);
    } catch (error) {
        res.status(500).json({ success: false, message: `Error al obtener logs: ${error.message}` });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;