// routes/historial.js
const express = require('express');
const router = express.Router();
const pool = require('../db/conexion.js'); // Asegúrate de exportar el pool en este archivo
const authenticateToken = require("../middlewares/authenticateToken");

// Obtener historial médico de las mascotas de un propietario por id_usuario
router.get('/usuario/:id_usuario', authenticateToken, async (req, res) => {
  const id_usuario = req.params.id_usuario;
  console.log('Ruta historial llamada con id_usuario:', req.params.id_usuario);

  try {
    const [rows] = await pool.query(`
      SELECT 
        h.cod_his AS cod_his,
        h.fech_his AS fech_his,
        h.descrip_his AS descrip_his,
        h.tratamiento,
        m.cod_mas AS cod_mas,
        m.nom_mas AS nom_mas,
        m.especie,
        m.raza,
        m.foto
      FROM historiales_medicos h
      JOIN mascotas m ON h.cod_mas = m.cod_mas
      JOIN propietarios p ON m.id_pro = p.id_pro
      JOIN usuarios u ON p.id_pro = u.id_usuario
      WHERE u.id_usuario = ?
    `, [id_usuario]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener historial por usuario:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

module.exports = router;
