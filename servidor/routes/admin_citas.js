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

router.get("/todas", isAdmin, async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query("CALL MostrarTodasLasCitasAdmin()");
        res.json(rows[0] || []);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error en el servidor al obtener citas." });
    } finally {
        if (connection) connection.release();
    }
});

router.post("/", isAdmin, async (req, res) => {
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

// RUTA PUT (ACTUALIZAR) - VERIFICADA
router.put("/:cod_cit", isAdmin, async (req, res) => {
    let connection;
    try {
        const { cod_cit } = req.params;
        const { fech_cit, hora, estado, notas, id_vet, cod_ser } = req.body;
        connection = await pool.getConnection();
        await connection.query("CALL ActualizarCitaAdmin(?, ?, ?, ?, ?, ?, ?)", 
            [cod_cit, fech_cit, hora, estado, notas, id_vet, cod_ser]
        );
        res.json({ success: true, message: "Cita actualizada exitosamente." });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error en el servidor al actualizar la cita: ${error.message}` });
    } finally {
        if (connection) connection.release();
    }
});

// RUTA DELETE (ELIMINAR) - VERIFICADA
router.delete("/:cod_cit", isAdmin, async (req, res) => {
    let connection;
    try {
      const { cod_cit } = req.params;
      connection = await pool.getConnection();
      await connection.query("CALL EliminarCita(?)", [cod_cit]);
      res.json({ success: true, message: "Cita eliminada exitosamente." });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error en servidor al eliminar." });
    } finally {
      if (connection) connection.release();
    }
});

router.get('/:cod_cit/logs', isAdmin, async (req, res) => {
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