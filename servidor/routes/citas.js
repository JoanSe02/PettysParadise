const express = require("express");
const router = express.Router();
const pool = require("../db/conexion");
const authenticateToken = require("../middlewares/authenticateToken");



// OBTENER CITAS (MODIFICADO PARA MANEJAR ROLES)
router.get("/", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { id_usuario, id_rol } = req.user;
    connection = await pool.getConnection();

    let query;
    let params;

    if (id_rol === 2) { // Rol Veterinario
      query = "CALL MostrarCitasPorVeterinario(?)";
      params = [id_usuario];
    } else if (id_rol === 3) { // Rol Propietario
      query = "CALL MostrarCitasPorPropietario(?)";
      params = [id_usuario];
    } else { // Administrador u otro rol pueden ver todas
      query = `
        SELECT c.*, 
               m.nom_mas AS mascota,
               CONCAT(u_pro.nombre, ' ', u_pro.apellido) AS propietario,
               CONCAT(u_vet.nombre, ' ', u_vet.apellido) AS veterinario,
               s.nom_ser AS servicio
        FROM citas c
        LEFT JOIN mascotas m ON c.cod_mas = m.cod_mas
        LEFT JOIN propietarios pro ON c.id_pro = pro.id_pro
        LEFT JOIN usuarios u_pro ON pro.id_pro = u_pro.id_usuario
        LEFT JOIN veterinarios v ON c.id_vet = v.id_vet
        LEFT JOIN usuarios u_vet ON v.id_usuario = u_vet.id_usuario
        LEFT JOIN servicios s ON c.cod_ser = s.cod_ser
        ORDER BY c.fech_cit DESC, c.hora DESC
      `;
      params = [];
    }

    const [rows] = await connection.query(query, params);
    res.json(rows[0] || rows);

  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener citas", error: error.message });
  } finally {
    if (connection) connection.release();
  }
});


// Obtener TODAS las citas (para el Administrador) - VERSIÓN CORREGIDA
router.get("/admin/todas", authenticateToken, async (req, res) => {
  let connection;
  try {
    if (req.user.id_rol !== 1) { 
      return res.status(403).json({ success: false, message: 'Acceso denegado. Se requiere rol de Administrador.' });
    }
    
    connection = await pool.getConnection();
    const [citas] = await connection.query(`
      SELECT 
        c.cod_cit, c.fech_cit, c.hora, c.estado, c.notas,
        m.nom_mas as mascota,
        CONCAT(p_u.nombre, ' ', p_u.apellido) as propietario,
        CONCAT(u_vet.nombre, ' ', u_vet.apellido) as veterinario,
        s.nom_ser as servicio
      FROM citas c
      LEFT JOIN mascotas m ON c.cod_mas = m.cod_mas
      LEFT JOIN propietarios p ON c.id_pro = p.id_pro
      LEFT JOIN usuarios p_u ON p.id_pro = p_u.id_usuario
      LEFT JOIN veterinarios v ON c.id_vet = v.id_vet
      LEFT JOIN usuarios u_vet ON v.id_vet = u_vet.id_usuario
      LEFT JOIN servicios s ON c.cod_ser = s.cod_ser
      ORDER BY c.fech_cit DESC, c.hora DESC
    `);
    
    res.json(citas);

  } catch (err) {
    console.error("Error al obtener todas las citas para admin:", err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  } finally {
    if (connection) connection.release(); 
  }
});

// Crear cita 
router.post("/", authenticateToken, async (req, res) => {
  const { id_pro, id_vet, cod_mas, cod_ser, fech_cit, hora, estado, notas } = req.body;
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.query(
      `CALL InsertarCita(?, ?, ?, ?, ?, ?, ?, @new_cita_id)`, 
      [ fech_cit, hora, cod_ser, id_vet, cod_mas, id_pro, notas || '' ]
    );
      
    const [[{ new_cita_id }]] = await connection.query(`SELECT @new_cita_id AS new_cita_id`);

    const [details] = await connection.query(`
      SELECT 
        u.email AS owner_email,
        u.nombre AS owner_name,
        m.nom_mas AS pet_name,
        s.nom_ser AS service_name,
        s.precio AS service_cost,
        CONCAT(v_u.nombre, ' ', v_u.apellido) AS vet_name
      FROM citas c
      JOIN usuarios u ON c.id_pro = u.id_usuario
      JOIN mascotas m ON c.cod_mas = m.cod_mas
      JOIN servicios s ON c.cod_ser = s.cod_ser
      JOIN usuarios v_u ON c.id_vet = v_u.id_usuario
      WHERE c.cod_cit = ?
    `, [new_cita_id]);

    res.status(201).json({
      success: true,
      message: "Cita creada exitosamente",
      emailDetails: details[0]
    });

  } catch (error) {
    console.error("Error al crear la cita:", error);
    res.status(500).json({ 
        success: false, 
        message: error.sqlMessage || "Error en el servidor al crear la cita",
    });
  } finally {
    if (connection) connection.release();
  }
});

// Actualizar cita (MODIFICADO con lógica de permisos mejorada)
router.put("/:cod_cit", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { cod_cit } = req.params;
    const { id_usuario, id_rol } = req.user; // Obtenemos el rol del usuario logueado

    connection = await pool.getConnection();

    // 1. Primero, obtenemos la cita para verificar los permisos
    const [citasExistentes] = await connection.query(
      `SELECT id_pro, id_vet FROM citas WHERE cod_cit = ?`, 
      [cod_cit]
    );

    if (citasExistentes.length === 0) {
      return res.status(404).json({ success: false, message: "La cita no fue encontrada." });
    }

    const cita = citasExistentes[0];
    const esPropietario = id_rol === 3 && cita.id_pro === id_usuario;
    const esVeterinarioAsignado = id_rol === 2 && cita.id_vet === id_usuario;
    const esAdmin = id_rol === 1;

    // 2. Si no es Propietario, ni el Veterinario asignado, ni un Admin, denegar acceso.
    if (!esPropietario && !esVeterinarioAsignado && !esAdmin) {
      return res.status(403).json({ success: false, message: "No tienes permiso para modificar esta cita" });
    }

    // 3. Si tiene permiso, proceder con la actualización
    const { cod_mas, cod_ser, id_vet, fech_cit, hora, estado, notas } = req.body;

    await connection.query(`CALL ActualizarCita(?, ?, ?, ?, ?, ?, ?, ?)`, [
      cod_cit,
      fech_cit,
      hora,
      cod_ser,
      id_vet,
      cod_mas,
      estado,
      notas,
    ]);

    res.json({ success: true, message: "Cita actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).json({ success: false, message: "Error al actualizar la cita", error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Cancelar cita (usando procedimiento)
router.put("/:cod_cit/cancelar", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { cod_cit } = req.params;
    const id_pro = req.user.id_usuario;
    connection = await pool.getConnection();

    await connection.query(`CALL CancelarCita(?, ?)`, [cod_cit, id_pro]);

    res.json({ success: true, message: "Cita cancelada exitosamente" });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    res.status(500).json({ success: false, message: "Error al cancelar la cita", error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// NUEVO: Endpoint para obtener estadísticas del dashboard del veterinario
router.get("/veterinario/stats", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { id_usuario } = req.user; // Obtenemos el ID del veterinario logueado

    connection = await pool.getConnection();

    // 1. Contar citas programadas para este veterinario (Pendientes o Confirmadas)
    const [citasResult] = await connection.query(
      "SELECT COUNT(*) as total FROM citas WHERE id_vet = ? AND estado IN ('PENDIENTE', 'CONFIRMADA')",
      [id_usuario]
    );
    const totalCitas = citasResult[0].total;

    // 2. Contar el total de pacientes registrados en la clínica
    const [pacientesResult] = await connection.query("SELECT COUNT(*) as total FROM mascotas");
    const totalPacientes = pacientesResult[0].total;

    // 3. Contar el total de historiales médicos registrados
    const [historialesResult] = await connection.query("SELECT COUNT(*) as total FROM historiales_medicos");
    const totalHistoriales = historialesResult[0].total;

    res.json({
      success: true,
      stats: {
        citasProgramadas: totalCitas,
        pacientes: totalPacientes,
        historialesMedicos: totalHistoriales,
      },
    });

  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
