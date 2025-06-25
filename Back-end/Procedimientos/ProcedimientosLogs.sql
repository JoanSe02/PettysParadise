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

CREATE PROCEDURE `mascotas_db`.`ObtenerLogsPorCita`(
    IN p_id_cita INT
)
BEGIN
    -- Selecciona todos los registros de la tabla logs_citas
    -- donde el id_cita_afectada coincida con el parámetro de entrada.
    SELECT
        id_log,
        id_cita_afectada,
        accion,
        descripcion,
        id_usuario_accion,
        fecha_hora_accion,
        usuario_db
    FROM
        logs_citas
    WHERE
        id_cita_afectada = p_id_cita;
END$$

DELIMITER ;
CALL mascotas_db.ObtenerLogsPorCita(4);