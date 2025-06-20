const express = require("express");
const router = express.Router();
const pool = require("../db/conexion"); // Asegúrate de tener configurado el pool de conexión MySQL

// Obtener perfil de usuario
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE id_usuario = ? AND estado = 1", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado o inactivo" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error al obtener datos del usuario" });
  }
});


// Actualizar email y teléfono
router.put("/actualizar/:id", async (req, res) => {
  const { id } = req.params;
  const { email, telefono } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE usuarios SET email = ?, telefono = ? WHERE id_usuario = ? AND estado = 1",
      [email, telefono, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado o inactivo" });
    }

    res.json({ success: true, message: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ success: false, message: "Error al actualizar perfil" });
  }
});



module.exports = router;
