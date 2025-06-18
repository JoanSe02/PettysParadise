USE mascotas_db;
DELIMITER $$

-- Crear historial médico
DROP PROCEDURE IF EXISTS CrearHistorial$$
CREATE PROCEDURE CrearHistorial(
    IN p_cod_mas INT,
    IN p_id_vet INT,
    IN p_fecha DATE,
    IN p_descripcion TEXT,
    IN p_tratamiento TEXT,
    IN p_motivo_consulta TEXT,
    IN p_peso_kg DECIMAL(5,2),
    IN p_temperatura_c DECIMAL(4,1),
    IN p_proximo_seguimiento DATE,
    IN p_costo_consulta DECIMAL(10,2),
    IN p_creado_por INT
)
BEGIN
    INSERT INTO historiales_medicos (
        cod_mas, id_vet, fech_his, descrip_his, tratamiento, motivo_consulta,
        peso_kg, temperatura_c, proximo_seguimiento, costo_consulta, creado_por, actualizado_por, activo
    )
    VALUES (
        p_cod_mas, p_id_vet, p_fecha, p_descripcion, p_tratamiento, p_motivo_consulta,
        p_peso_kg, p_temperatura_c, p_proximo_seguimiento, p_costo_consulta, p_creado_por, p_creado_por, 1
    );
END$$

-- Obtener todos los historiales médicos
DROP PROCEDURE IF EXISTS ObtenerTodosLosHistoriales$$
CREATE PROCEDURE ObtenerTodosLosHistoriales()
BEGIN
    SELECT 
        h.cod_his,
        h.fech_his AS fecha,
        -- AJUSTE 1: Se añade el alias "descripcion" que faltaba
        h.descrip_his AS descripcion, 
        h.tratamiento,
        h.motivo_consulta,
        h.peso_kg,
        h.temperatura_c,
        h.proximo_seguimiento,
        h.costo_consulta,
        h.cod_mas,
        m.nom_mas AS nombre_mascota,
        m.especie,
        m.raza,
        -- AJUSTE 2: Se añade el campo "foto" de la mascota que faltaba
        m.foto,
        CONCAT(u_pro.nombre, ' ', u_pro.apellido) AS nombre_propietario,
        CONCAT(u_vet.nombre, ' ', u_vet.apellido) AS nombre_veterinario
    FROM historiales_medicos h
    JOIN mascotas m ON h.cod_mas = m.cod_mas
    JOIN propietarios p ON m.id_pro = p.id_pro
    JOIN usuarios u_pro ON p.id_pro = u_pro.id_usuario
    LEFT JOIN veterinarios v ON h.id_vet = v.id_vet
    LEFT JOIN usuarios u_vet ON v.id_vet = u_vet.id_usuario
    WHERE h.activo = 1
    ORDER BY h.fech_his DESC;
END$$

-- Obtener historiales médicos por mascota
DROP PROCEDURE IF EXISTS ObtenerHistorialesPorMascota$$
CREATE PROCEDURE ObtenerHistorialesPorMascota(
    IN p_cod_mas INT
)
BEGIN
    SELECT * FROM historiales_medicos WHERE cod_mas = p_cod_mas
    ORDER BY fecha DESC;
END$$

-- Obtener historial médico por código
DROP PROCEDURE IF EXISTS ObtenerHistorialPorCodigo$$
CREATE PROCEDURE ObtenerHistorialPorCodigo(
    IN p_cod_his INT,
    IN p_cod_mas INT
)
BEGIN
    SELECT h.*, m.nom_masAS nombre_mascota, m.especie, m.raza
    FROM historiales_medicos h
    JOIN mascotas m ON h.cod_mas = m.cod_mas
    WHERE h.cod_his = p_cod_his AND h.codigo_mascota = p_codigo_mascota;
END$$

-- Actualizar historial médico
DROP PROCEDURE IF EXISTS ActualizarHistorial$$
CREATE PROCEDURE ActualizarHistorial(
    IN p_cod_his INT,
    IN p_id_vet INT,
    IN p_fecha DATE,
    IN p_descripcion TEXT,
    IN p_tratamiento TEXT,
    IN p_motivo_consulta TEXT,
    IN p_peso_kg DECIMAL(5,2),
    IN p_temperatura_c DECIMAL(4,1),
    IN p_proximo_seguimiento DATE,
    IN p_costo_consulta DECIMAL(10,2),
    IN p_actualizado_por INT
)
BEGIN
    UPDATE historiales_medicos
    SET
        id_vet = p_id_vet,
        fech_his = p_fecha,
        descrip_his = p_descripcion,
        tratamiento = p_tratamiento,
        motivo_consulta = p_motivo_consulta,
        peso_kg = p_peso_kg,
        temperatura_c = p_temperatura_c,
        proximo_seguimiento = p_proximo_seguimiento,
        costo_consulta = p_costo_consulta,
        actualizado_por = p_actualizado_por
    WHERE cod_his = p_cod_his;
END$$

-- Eliminar un historial (NUEVO)
DROP PROCEDURE IF EXISTS EliminarHistorial$$
CREATE PROCEDURE EliminarHistorial(
    IN p_cod_his INT,
    IN p_id_usuario_eliminador INT -- Nuevo parámetro para saber quién elimina
)
BEGIN
    UPDATE historiales_medicos
    SET 
        activo = 0,
        eliminado_por = p_id_usuario_eliminador,
        fecha_eliminacion = NOW()
    WHERE cod_his = p_cod_his AND activo = 1;
END$$


DELIMITER ;