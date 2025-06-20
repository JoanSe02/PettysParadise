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

module.exports = router;