DELIMITER $$

-- Trigger para registrar la CREACIÓN de un historial
CREATE TRIGGER `after_historial_insert`
AFTER INSERT ON `historiales_medicos`
FOR EACH ROW
BEGIN
    INSERT INTO `historiales_log` (cod_his_fk, accion, id_usuario_modificador)
    VALUES (NEW.cod_his, 'CREACION', NEW.creado_por);
END$$

-- Trigger para registrar la MODIFICACIÓN y el BORRADO LÓGICO de un historial
CREATE TRIGGER `after_historial_update`
AFTER UPDATE ON `historiales_medicos`
FOR EACH ROW
BEGIN
    -- Si el campo 'activo' cambia de 1 (activo) a 0 (eliminado)
    IF OLD.act_his = 1 AND NEW.act_his = 0 THEN
        INSERT INTO `historiales_log` (
            cod_his_fk, 
            accion, 
            id_usuario_modificador,
            descripcion_anterior,
            tratamiento_anterior
        )
        VALUES (
            NEW.cod_his, 
            'ELIMINACION', 
            NEW.eliminado_por,
            OLD.descrip_his,
            OLD.tratamiento
        );
    -- Si otros campos importantes cambian (y el registro sigue activo)
    ELSEIF OLD.act_his = 1 AND (OLD.descrip_his <> NEW.descrip_his OR OLD.tratamiento <> NEW.tratamiento) THEN
        INSERT INTO `historiales_log` (
            cod_his_fk, 
            accion, 
            id_usuario_modificador,
            descripcion_anterior,
            tratamiento_anterior
        )
        VALUES (
            NEW.cod_his, 
            'MODIFICACION', 
            NEW.actualizado_por,
            OLD.descrip_his,
            OLD.tratamiento
        );
    END IF;
END$$

DELIMITER ;