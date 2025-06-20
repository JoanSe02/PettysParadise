const pool = require("../db/conexion");

const verificarPropietario = async (req, res) => {
  let connection;
  try {
    const userId = req.user.id_usuario;
    connection = await pool.getConnection();

    const [userRows] = await connection.query(
      "SELECT id_rol FROM usuarios WHERE id_usuario = ?",
      [userId]
    );

    if (userRows.length === 0) return res.sendStatus(403); // Usuario no encontrado
    if (userRows[0].id_rol !== 3) return res.sendStatus(403); // No es propietario

    const [rows] = await connection.query("CALL VerificarSiEsPropietario(?)", [userId]);
    const resultado = rows[0][0].resultado;

    if (resultado === "ES_PROPIETARIO") {
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  } catch (err) {
    console.error("Error al verificar propietario:", err);
    res.status(500).json({ message: "Error del servidor" });
  } finally {
    if (connection) connection.release();
  }
};

const verificarAdministrador = async (req, res) => {
  let connection;
  try {
    const userId = req.user.id_usuario;
    connection = await pool.getConnection();

    const [userRows] = await connection.query(
      "SELECT id_rol FROM usuarios WHERE id_usuario = ?",
      [userId]
    );

    if (userRows.length === 0) return res.sendStatus(403); // Usuario no encontrado
    if (userRows[0].id_rol !== 1) return res.sendStatus(403); // No es administrador

    const [rows] = await connection.query("CALL VerificarSiEsAdministrador(?)", [userId]);
    const resultado = rows[0][0].resultado;

    if (resultado === "ES_ADMIN") {
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  } catch (err) {
    console.error("Error al verificar administrador:", err);
    res.status(500).json({ message: "Error del servidor" });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  verificarPropietario,
  verificarAdministrador,
};
