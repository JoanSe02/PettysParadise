// RUTA: servidor/routes/users.js (ARCHIVO NUEVO)
const express = require("express");
const router = express.Router();
const pool = require("../db/conexion");

// Endpoint para obtener todos los usuarios
// GET /api/users
router.get('/', async (req, res) => {
    try {
        // Esta consulta obtiene todos los usuarios con el nombre de su rol
        const [users] = await pool.query(`
            SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.id_rol, r.rol
            FROM usuarios u
            JOIN rol r ON u.id_rol = r.id_rol
            ORDER BY u.nombre, u.apellido;
        `);
        res.json(users);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ success: false, message: "Error al obtener la lista de usuarios." });
    }
});
router.get('/todos', async (req, res) => {
  try {
    // La consulta SQL que une las tablas usuarios y propietarios
    const sqlQuery = `
      SELECT
          u.id_usuario AS id_usu,
          u.nombre AS nom_usu,
          u.apellido AS ape_usu
      FROM
          usuarios u
      INNER JOIN
          propietarios p ON u.id_usuario = p.id_pro
      WHERE
          u.estado = 1 AND p.act_pro = 1
      ORDER BY
          u.nombre ASC;
    `;

    // Ejecutamos la consulta usando el pool
    const [rows] = await pool.query(sqlQuery);

    // Devolvemos los resultados como una respuesta JSON
    res.json(rows);

  } catch (error) {
    // Si algo sale mal, lo registramos en la consola y enviamos un error 500
    console.error('Error al obtener la lista de propietarios:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener los propietarios' });
  }
});

module.exports = router;