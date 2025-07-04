use mascotas_db;

DELIMITER $$
DROP PROCEDURE IF EXISTS `RegistrarLogCita`;
CREATE PROCEDURE `RegistrarLogCita`(
    IN p_cod_cit INT,
    IN p_accion VARCHAR(10),
    IN p_descripcion TEXT,
    IN p_id_usuario INT
)
BEGIN
    INSERT INTO logs_citas (id_cita_afectada, accion, descripcion, id_usuario_accion)
    VALUES (p_cod_cit, p_accion, p_descripcion, p_id_usuario);
END$$
DELIMITER ;
DELIMITER $$

DROP PROCEDURE IF EXISTS `ObtenerLogsPorCita`$$

CREATE PROCEDURE `ObtenerLogsPorCita`(
    IN p_id_cita INT
)
BEGIN
    SELECT
        l.id_log,
        l.fecha_hora_accion AS fecha_hora,
        l.accion AS nivel,
        l.descripcion AS mensaje,
        -- Unimos con la tabla usuarios para obtener el nombre.
        -- Usamos COALESCE para mostrar el usuario de la BD si el log es antiguo (antes de este cambio).
        COALESCE(
            CONCAT(u.nombre, ' ', u.apellido, ' (', u.id_usuario, ')'), -- Formato: "Nombre Apellido (ID)"
            l.usuario_db -- Fallback para logs viejos que muestran "root@localhost"
        ) AS usuario_modificador
    FROM
        logs_citas AS l
    -- Hacemos un LEFT JOIN por si el usuario fue eliminado o el log es antiguo
    LEFT JOIN 
        usuarios AS u ON l.id_usuario_accion = u.id_usuario
    WHERE
        l.id_cita_afectada = p_id_cita
    ORDER BY
        l.fecha_hora_accion DESC;
END$$

DELIMITER ;