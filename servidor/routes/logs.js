// RUTA: servidor/routes/logs.js

const express = require('express');
const router = express.Router();
const pool = require('../db/conexion');
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/citas', authenticateToken, async (req, res) => {
    let connection;
    try {
        if (req.user.id_rol !== 1) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        connection = await pool.getConnection();

        // --- CONSULTA CORREGIDA ---
        // Se cambió el nombre de la tabla a "logs_citas" para que coincida con tu base de datos.
        const [logs] = await connection.query(`
            SELECT 
                cl.id_log,
                cl.id_cita_afectada,
                cl.accion,
                cl.descripcion,
                cl.usuario_db,
                cl.fecha_hora_accion AS fecha_modificacion
            FROM logs_citas cl
            ORDER BY cl.fecha_hora_accion DESC
        `);
        
        // Adaptamos la respuesta para que coincida con lo que el frontend espera
        const formattedLogs = logs.map(log => ({
            log_id: log.id_log,
            cita_id: log.id_cita_afectada,
            id_usuario_modificador: log.usuario_db, // Usamos el usuario de la BD
            nombre_usuario: log.usuario_db, // Se muestra el usuario de la BD
            rol_usuario: 'N/A', // La tabla de logs no guarda el rol, lo dejamos como N/A
            fecha_modificacion: log.fecha_modificacion,
            accion_realizada: log.accion,
            detalles_anteriores: log.descripcion, // El campo 'descripcion' contiene los detalles
            detalles_nuevos: '' // Tu tabla de log actual no separa detalles nuevos
        }));

        res.json(formattedLogs);

    } catch (error) {
        console.error('Error al obtener los logs de citas:', error);
        res.status(500).send('Error en el servidor');
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;