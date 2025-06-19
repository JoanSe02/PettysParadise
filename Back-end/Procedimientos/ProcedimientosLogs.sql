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