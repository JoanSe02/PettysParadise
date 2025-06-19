// routes/historial.js
const express = require('express');
const router = express.Router();
const pool = require('../db/conexion.js'); // Asegúrate de exportar el pool en este archivo
const authenticateToken = require("../middlewares/authenticateToken");

// Obtener historial médico de las mascotas de un propietario por id_usuario
router.get('/usuario/:id_usuario', authenticateToken, async (req, res) => {
  const id_usuario_propietario = req.params.id_usuario;

  // Verificación de seguridad: el usuario solo puede ver su propio historial
  if (req.user.id_usuario !== parseInt(id_usuario_propietario, 10)) {
    return res.status(403).json({ success: false, message: 'Acceso denegado.' });
  }

  try {
    // <-- MODIFICADO: Consulta SQL actualizada para obtener todos los detalles necesarios para el PDF -->
    const [rows] = await pool.query(`
      SELECT 
        h.cod_his,
        h.fech_his AS fecha,
        h.descrip_his AS descripcion,
        h.tratamiento,
        h.motivo_consulta,
        h.peso_kg,
        h.temperatura_c,
        h.proximo_seguimiento,
        h.costo_consulta,
        m.cod_mas,
        m.nom_mas AS nombre_mascota,
        m.especie,
        m.raza,
        m.foto,
        CONCAT(u_pro.nombre, ' ', u_pro.apellido) AS nombre_propietario,
        CONCAT(u_vet.nombre, ' ', u_vet.apellido) AS nombre_veterinario
      FROM historiales_medicos h
      JOIN mascotas m ON h.cod_mas = m.cod_mas
      JOIN propietarios p ON m.id_pro = p.id_pro
      JOIN usuarios u_pro ON p.id_pro = u_pro.id_usuario
      LEFT JOIN veterinarios v ON h.id_vet = v.id_vet
      LEFT JOIN usuarios u_vet ON v.id_vet = u_vet.id_usuario
      WHERE u_pro.id_usuario = ? AND h.activo = 1
      ORDER BY h.fech_his DESC;
    `, [id_usuario_propietario]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener historial por usuario:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

module.exports = router;
