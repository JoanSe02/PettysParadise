const express = require("express");
const router = express.Router();
const pool = require("../db/conexion");
const connection = require("../db/conexion");
const authenticateToken = require("../middlewares/authenticateToken");

// OBTENER TODOS LOS HISTORIALES (Ruta principal para el veterinario)
router.get("/", authenticateToken, async (req, res) => {
  let connection;
  try {
      connection = await pool.getConnection();
      const [rows] = await connection.query("CALL ObtenerTodosLosHistoriales()");
      res.json(rows[0] || []);
  } catch (error) {
      console.error("Error al obtener historiales:", error);
      res.status(500).json({ success: false, message: "Error del servidor" });
  } finally {
      if (connection) connection.release();
  }
});

// CREAR NUEVO HISTORIAL
router.post("/", authenticateToken, async (req, res) => {
  const { cod_mas, fecha, descripcion, tratamiento, motivo_consulta, peso_kg, temperatura_c, proximo_seguimiento, costo_consulta } = req.body;
  const id_vet_autenticado = req.user.id_usuario; 
  const creado_por = req.user.id_usuario;

  try {
    await connection.query(
      "CALL CrearHistorial(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [cod_mas, id_vet_autenticado, fecha, descripcion, tratamiento, motivo_consulta, peso_kg, temperatura_c, proximo_seguimiento, costo_consulta, creado_por]
    );
    res.status(201).json({ message: "Historial médico registrado exitosamente." });
  } catch (error) {
    console.error("Error al registrar historial médico:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});


// ACTUALIZAR HISTORIAL 
router.put("/:cod_his", authenticateToken, async (req, res) => {
  let connection;
  try {
      const { cod_his } = req.params;
      const id_usuario_modificador = req.user.id_usuario;
      const { 
          id_vet, fecha, descripcion, tratamiento, motivo_consulta,
          peso_kg, temperatura_c, proximo_seguimiento, costo_consulta 
      } = req.body;

      connection = await pool.getConnection();
      await connection.query("CALL ActualizarHistorial(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
          cod_his, id_vet, fecha, descripcion, tratamiento, motivo_consulta,
          peso_kg, temperatura_c, proximo_seguimiento, costo_consulta,
          id_usuario_modificador
      ]);
      res.json({ success: true, message: "Historial actualizado exitosamente" });
  } catch (error) {
      console.error("Error al actualizar historial:", error);
      res.status(500).json({ success: false, message: error.sqlMessage || "Error del servidor" });
  } finally {
      if (connection) connection.release();
  }
});
// Obtener historiales por mascota
router.get("/mascota/:cod_mas", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { cod_mas } = req.params;
    
    connection = await pool.getConnection();
    
    // Usar el procedimiento almacenado ObtenerHistorialesPorMascota
    const [rows] = await connection.query(`CALL ObtenerHistorialesPorMascota(?)`, [cod_mas]);
    
    // Los procedimientos almacenados devuelven un array de arrays
    const historiales = rows[0] || [];
    
    res.json(historiales);
  } catch (error) {
    console.error("Error al obtener historiales por mascota:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener historiales", 
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

// Obtener historial específico por código
router.get("/:cod_his", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { cod_his } = req.params;
    
    connection = await pool.getConnection();
    
    // Como el procedimiento ObtenerHistorialPorCodigo tiene errores, usamos una consulta directa
    const [rows] = await connection.query(`
      SELECT h.*, 
             m.nom_mas AS mascota,
             m.especie, 
             m.raza,
             CONCAT(u.nombre, ' ', u.apellido) AS propietario
      FROM historiales_medicos h
      JOIN mascotas m ON h.cod_mas = m.cod_mas
      JOIN propietarios p ON m.id_pro = p.id_pro
      JOIN usuarios u ON p.id_pro = u.id_usuario
      WHERE h.cod_his = ?
    `, [cod_his]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Historial no encontrado" 
      });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener el historial", 
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

// ELIMINAR HISTORIAL
router.delete("/:cod_his", authenticateToken, async (req, res) => {
  let connection;
  try {
      const { cod_his } = req.params;
      const id_usuario_eliminador = req.user.id_usuario; 
      connection = await pool.getConnection();
      await connection.query("CALL EliminarHistorial(?, ?)", [cod_his, id_usuario_eliminador]);
      res.json({ success: true, message: "Historial eliminado exitosamente" });
  } catch (error) {
      console.error("Error al eliminar lógicamente el historial:", error);
      res.status(500).json({ success: false, message: error.sqlMessage || "Error del servidor" });
  } finally {
      if (connection) connection.release();
  }
});

// Ruta adicional para obtener historiales con información completa (para el frontend)
router.get("/obtener/completos", authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Consulta completa con toda la información necesaria
    const [rows] = await connection.query(`
      SELECT h.cod_his,
             h.fech_his,
             h.descrip_his,
             h.tratamiento,
             h.cod_mas,
             m.nom_mas AS mascota,
             m.especie,
             m.raza,
             CONCAT(u.nombre, ' ', u.apellido) AS propietario
      FROM historiales_medicos h
      JOIN mascotas m ON h.cod_mas = m.cod_mas
      JOIN propietarios p ON m.id_pro = p.id_pro
      JOIN usuarios u ON p.id_pro = u.id_usuario
      ORDER BY h.fech_his DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener historiales completos:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener historiales", 
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

// ******* NUEVA RUTA PARA VISUALIZAR EL LOG *******
router.get("/:cod_his/log", authenticateToken, async (req, res) => {
  let connection;
  try {
      const { cod_his } = req.params;
      connection = await pool.getConnection();

      const [logs] = await connection.query(`
          SELECT 
              l.accion,
              l.fecha_modificacion,
              l.descripcion_anterior,
              l.tratamiento_anterior,
              CONCAT(u.nombre, ' ', u.apellido) AS nombre_modificador
          FROM historiales_log l
          JOIN usuarios u ON l.id_usuario_modificador = u.id_usuario
          WHERE l.cod_his_fk = ?
          ORDER BY l.fecha_modificacion DESC
      `, [cod_his]);
      
      res.json({ success: true, data: logs });

  } catch (error) {
      console.error("Error al obtener el log del historial:", error);
      res.status(500).json({ success: false, message: "Error del servidor" });
  } finally {
      if (connection) connection.release();
  }
});

module.exports = router;