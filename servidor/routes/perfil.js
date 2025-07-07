const express = require("express");
const router = express.Router();
const pool = require("../db/conexion");
const bcrypt = require("bcryptjs"); // Importamos bcrypt

// Obtener perfil de usuario (sin cambios)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE id_usuario = ? AND estado = 1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado o inactivo" });
    }
    // No enviamos la contraseña al frontend
    delete rows[0].contrasena;
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error al obtener datos del usuario" });
  }
});

// Actualizar perfil de usuario (LÓGICA MEJORADA)
router.put("/actualizar/:id", async (req, res) => {
  const { id } = req.params;
  const { email, telefono, direccion, ciudad, password, currentPassword } = req.body;

  // 1. Validar que los campos básicos no estén vacíos
  if (!email || !telefono || !direccion || !ciudad) {
    return res.status(400).json({ success: false, message: "Los campos de email, teléfono, dirección y ciudad son obligatorios." });
  }

  try {
    // 2. Obtener el usuario actual de la BD para verificar la contraseña
    const [users] = await pool.query("SELECT * FROM usuarios WHERE id_usuario = ? AND estado = 1", [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado o inactivo" });
    }
    const user = users[0];
    
    // Lista de campos a actualizar y sus valores
    const fieldsToUpdate = { email, telefono, direccion, ciudad };
    
    // 3. Lógica para la contraseña
    if (password) {
      // CASO A: El usuario quiere cambiar su contraseña
      const salt = await bcrypt.genSalt(10);
      fieldsToUpdate.contrasena = await bcrypt.hash(password, salt);
    } else {
      // CASO B: El usuario NO cambia su contraseña, así que verificamos la actual
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Debes proporcionar tu contraseña actual para guardar los cambios." });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.contrasena);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "La contraseña actual es incorrecta." });
      }
    }

    // 4. Construir y ejecutar la consulta de actualización
    const queryFields = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(", ");
    const queryValues = [...Object.values(fieldsToUpdate), id];
    
    const [result] = await pool.query(
      `UPDATE usuarios SET ${queryFields} WHERE id_usuario = ? AND estado = 1`,
      queryValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se pudo actualizar el usuario." });
    }

    res.json({ success: true, message: "Perfil actualizado correctamente" });

  } catch (error) {
    // Manejo de error para correos duplicados
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: "El correo electrónico ya está en uso por otra cuenta." });
    }
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor al actualizar el perfil." });
  }
});

module.exports = router;