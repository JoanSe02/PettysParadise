// RUTA: servidor/routes/admin_citas.js (ARCHIVO NUEVO)
const express = require("express");
const router = express.Router();
const pool = require("../db/conexion");
const authenticateToken = require("../middlewares/authenticateToken");

const isAdmin = (req, res, next) => {
    if (req.user.id_rol !== 1) {
        return res.status(403).json({ success: false, message: "Acceso denegado." });
    }
    next();
};

const registrarLog = async (cod_cit, accion, descripcion, usuario_id) => {
    let connection;
    try {
        connection = await pool.getConnection();
        // Llama al nuevo procedimiento que crearemos en la BD
        await connection.query("CALL RegistrarLogCita(?, ?, ?, ?)", [cod_cit, accion, descripcion, usuario_id]);
    } catch (error) {
        console.error("Error al registrar el log:", error);
    } finally {
        if (connection) connection.release();
    }
};

// --- NUEVOS ENDPOINTS SEGUROS PARA ADMIN ---

// Crear Cita
router.post('/', isAdmin, async (req, res) => {
    const { id_pro, id_vet, cod_mas, cod_ser, fech_cit, hora, notas } = req.body;
    try {
        const [result] = await pool.query("CALL InsertarCita(?, ?, ?, ?, ?, ?, ?)", [fech_cit, hora, cod_ser, id_vet, cod_mas, id_pro, notas || '']);
        const newCitaId = result[0][0].new_cita_id;
        await registrarLog(newCitaId, 'INSERT', `Admin creó la cita.`, req.user.id_usuario);
        res.status(201).json({ success: true, message: "Cita creada." });
    } catch (error) { res.status(500).json({ success: false, message: "Error al crear la cita." }); }
});

// Actualizar Cita
router.put('/:cod_cit', isAdmin, async (req, res) => {
    const { cod_cit } = req.params;
    const { fech_cit, hora, cod_ser, id_vet, cod_mas, id_pro, estado, notas } = req.body;
    try {
        await pool.query("CALL ActualizarCita(?, ?, ?, ?, ?, ?, ?, ?, ?)", [cod_cit, fech_cit, hora, cod_ser, id_vet, cod_mas, id_pro, estado, notas]);
        await registrarLog(cod_cit, 'UPDATE', `Admin actualizó la cita. Estado: ${estado}.`, req.user.id_usuario);
        res.json({ success: true, message: "Cita actualizada." });
    } catch (error) { res.status(500).json({ success: false, message: "Error al actualizar la cita." }); }
});

// Cancelar Cita
router.put('/:cod_cit/cancelar', isAdmin, async (req, res) => {
    const { cod_cit } = req.params;
    try {
        await pool.query("CALL CancelarCita(?)", [cod_cit]);
        await registrarLog(cod_cit, 'CANCEL', `Admin canceló la cita.`, req.user.id_usuario);
        res.json({ success: true, message: "Cita cancelada." });
    } catch (error) { res.status(500).json({ success: false, message: "Error al cancelar la cita." }); }
});

// Obtener Logs con Nombre de Usuario
router.get('/:cod_cit/logs', isAdmin, async (req, res) => {
    const { cod_cit } = req.params;
    try {
        const [logs] = await pool.query(`
            SELECT l.*, CONCAT(u.nombre, ' ', u.apellido) as nombre_usuario_accion, r.rol as rol_usuario_accion
            FROM logs_citas l
            LEFT JOIN usuarios u ON l.id_usuario_accion = u.id_usuario
            LEFT JOIN rol r ON u.id_rol = r.id_rol
            WHERE l.id_cita_afectada = ? ORDER BY l.fecha_hora_accion DESC
        `, [cod_cit]);
        res.json({ success: true, data: logs });
    } catch (error) { res.status(500).json({ success: false, message: "Error al obtener los logs." }); }
});

module.exports = router;