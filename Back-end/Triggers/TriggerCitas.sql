DELIMITER $$

-- Trigger para registrar NUEVAS citas 
CREATE TRIGGER trg_citas_after_insert
AFTER INSERT ON citas
FOR EACH ROW
BEGIN
    DECLARE descripcion_log TEXT;
    SET descripcion_log = CONCAT('Se creó una nueva cita. ID: ', NEW.cod_cit, ', Fecha: ', NEW.fech_cit, ', Estado: ''', NEW.estado, '''.');
    INSERT INTO logs_citas (id_cita_afectada, accion, descripcion, usuario_db)
    VALUES (NEW.cod_cit, 'INSERT', descripcion_log, USER());
END$$


-- Trigger para registrar ACTUALIZACIONES de citas 
CREATE TRIGGER trg_citas_after_update
AFTER UPDATE ON citas
FOR EACH ROW
BEGIN
    DECLARE descripcion_log TEXT;
    SET descripcion_log = CONCAT('Se actualizó la cita ID: ', OLD.cod_cit, '.');
    IF OLD.estado <> NEW.estado THEN
        SET descripcion_log = CONCAT(descripcion_log, ' Estado cambió de ''', OLD.estado, ''' a ''', NEW.estado, '''.');
    END IF;
    IF OLD.fech_cit <> NEW.fech_cit THEN
        SET descripcion_log = CONCAT(descripcion_log, ' Fecha cambió de ''', OLD.fech_cit, ''' a ''', NEW.fech_cit, '''.');
    END IF;
     IF OLD.hora <> NEW.hora THEN
        SET descripcion_log = CONCAT(descripcion_log, ' Hora cambió de ''', OLD.hora, ''' a ''', NEW.hora, '''.');
    END IF;

    -- Solo inserta el log si realmente hubo un cambio en los campos monitoreados
    IF OLD.estado <> NEW.estado OR OLD.fech_cit <> NEW.fech_cit OR OLD.hora <> NEW.hora THEN
        INSERT INTO logs_citas (id_cita_afectada, accion, descripcion, usuario_db)
        VALUES (OLD.cod_cit, 'UPDATE', descripcion_log, USER());
    END IF;
END$$


-- Trigger para registrar ELIMINACIÓN de citas
CREATE TRIGGER trg_citas_after_delete
AFTER DELETE ON citas
FOR EACH ROW
BEGIN
    DECLARE descripcion_log TEXT;
    SET descripcion_log = CONCAT('Se eliminó la cita ID: ', OLD.cod_cit, '. Datos previos: Fecha ''', OLD.fech_cit, ''', Estado ''', OLD.estado, '''.');
    INSERT INTO logs_citas (id_cita_afectada, accion, descripcion, usuario_db)
    VALUES (OLD.cod_cit, 'DELETE', descripcion_log, USER());
END$$

DELIMITER ;