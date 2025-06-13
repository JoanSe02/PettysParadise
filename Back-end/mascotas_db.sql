-- Base de datos unificada para sistema de mascotas - Versión 2
CREATE DATABASE mascotas_db;
USE mascotas_db;

-- Tabla de roles
CREATE TABLE rol (
    id_rol INT(11) PRIMARY KEY NOT NULL COMMENT 'Identificador único del rol',
    rol VARCHAR(50) NOT NULL COMMENT 'Nombre del rol'
);

-- Tabla de tipos de persona
CREATE TABLE tipo_persona (
    id_tipo INT(11) PRIMARY KEY NOT NULL COMMENT 'Identificador único del tipo de persona',
    tipo VARCHAR(50) NOT NULL COMMENT 'Descripción del tipo de persona'
);

-- Tabla principal de usuarios
CREATE TABLE usuarios (
    tipo_doc ENUM('C.C','C.E') COMMENT 'Tipo de documento de identidad',
    id_usuario INT(11) PRIMARY KEY NOT NULL COMMENT 'Identificador único del usuario',
    nombre VARCHAR(50) NOT NULL COMMENT 'Nombre del usuario',
    apellido VARCHAR(30) NOT NULL COMMENT 'Apellido del usuario',
    ciudad VARCHAR(50) NOT NULL COMMENT 'Ciudad de residencia del usuario',
    direccion VARCHAR(100) NOT NULL COMMENT 'Dirección de residencia del usuario',
    telefono VARCHAR(20) NOT NULL COMMENT 'Número de teléfono del usuario',
    fecha_nacimiento DATE NOT NULL COMMENT 'Fecha de nacimiento del usuario',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Correo electrónico del usuario',
    contrasena VARCHAR(255) NOT NULL COMMENT 'Contraseña del usuario',
    id_tipo INT(11) NOT NULL COMMENT 'Tipo de persona (FK)',
    id_rol INT(11) NOT NULL COMMENT 'Rol del usuario (FK)',
    intentos_fallidos INT DEFAULT 0 COMMENT 'Número de intentos fallidos de inicio de sesión',
    cuenta_bloqueada TINYINT(1) DEFAULT 0 COMMENT 'Indica si la cuenta está bloqueada (1) o no (0)',
    fecha_bloqueo DATETIME DEFAULT NULL COMMENT 'Fecha y hora en que se bloqueó la cuenta',
    razon_bloqueo VARCHAR(255) DEFAULT NULL COMMENT 'Razón por la que se bloqueó la cuenta',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de registro del usuario',
    activo TINYINT(1) DEFAULT 1 COMMENT 'Estado activo (1) o inactivo (0) del usuario',
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    FOREIGN KEY (id_tipo) REFERENCES tipo_persona(id_tipo)
);

-- Tabla de administradores
CREATE TABLE administradores (
    id_admin INT(11) PRIMARY KEY NOT NULL COMMENT 'Identificador del administrador (FK a usuarios)',
    cargo VARCHAR(100) NOT NULL COMMENT 'Cargo del administrador',
    fecha_ingreso DATE NOT NULL COMMENT 'Fecha de ingreso del administrador',
    FOREIGN KEY (id_admin) REFERENCES usuarios(id_usuario)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- Tabla de propietarios
CREATE TABLE propietarios (
    id_pro INT(11) PRIMARY KEY NOT NULL COMMENT 'Identificador del propietario (FK a usuarios)',
    FOREIGN KEY (id_pro) REFERENCES usuarios(id_usuario)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- Tabla de veterinarios
CREATE TABLE veterinarios (
    id_vet INT(11) PRIMARY KEY NOT NULL COMMENT 'Identificador del veterinario (FK a usuarios)',
    especialidad VARCHAR(100) NOT NULL COMMENT 'Especialidad del veterinario',
    horario VARCHAR(255) NOT NULL COMMENT 'Horario de trabajo del veterinario',
    FOREIGN KEY (id_vet) REFERENCES usuarios(id_usuario)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- Tabla de mascotas
CREATE TABLE mascotas (
    cod_mas INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Código único de la mascota',
    nom_mas VARCHAR(100) NOT NULL COMMENT 'Nombre de la mascota',
    especie VARCHAR(100) NOT NULL COMMENT 'Especie de la mascota',
    raza VARCHAR(100) NOT NULL COMMENT 'Raza de la mascota',
    edad DECIMAL(10,2) NOT NULL COMMENT 'Edad de la mascota en años',
    genero VARCHAR(25) NOT NULL COMMENT 'Género de la mascota',
    peso DECIMAL(10,2) NOT NULL COMMENT 'Peso de la mascota en kg',
    id_pro INT(11) NOT NULL COMMENT 'Identificador del propietario (FK)',
    foto VARCHAR(255) NOT NULL COMMENT 'Ruta de la foto de la mascota',
    FOREIGN KEY (id_pro) REFERENCES propietarios(id_pro)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- Tabla de servicios
CREATE TABLE servicios (
    cod_ser INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Código único del servicio',
    nom_ser VARCHAR(100) NOT NULL COMMENT 'Nombre del servicio',
    descrip_ser TEXT COMMENT 'Descripción detallada del servicio',
    precio DECIMAL(20,2) NOT NULL COMMENT 'Precio del servicio'
);

-- Tabla de historiales médicos (con todas las mejoras incluidas)
CREATE TABLE historiales_medicos (
    cod_his INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Código del historial médico',
    fech_his DATE NOT NULL COMMENT 'Fecha del registro médico',
    descrip_his TEXT COMMENT 'Descripción del diagnóstico o procedimiento',
    tratamiento TEXT COMMENT 'Tratamiento aplicado',
    cod_mas INT(11) NOT NULL COMMENT 'Identificador de la mascota (FK)',
    id_vet INT NOT NULL COMMENT 'Veterinario que atendió la consulta',
    motivo_consulta TEXT NULL COMMENT 'Razón principal de la visita',
    peso_kg DECIMAL(5,2) NULL COMMENT 'Peso de la mascota en la consulta',
    temperatura_c DECIMAL(4,1) NULL COMMENT 'Temperatura en grados Celsius',
    proximo_seguimiento DATE NULL COMMENT 'Fecha recomendada para la próxima visita',
    costo_consulta DECIMAL(10,2) NULL DEFAULT 0.00 COMMENT 'Costo asociado a esta consulta',
    creado_por INT NULL COMMENT 'ID del usuario que creó el registro',
    actualizado_por INT NULL COMMENT 'ID del último usuario que modificó el registro',
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de la última modificación',
    activo TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Activo, 0 = Eliminado',
    eliminado_por INT NULL COMMENT 'ID del usuario que eliminó el registro',
    fecha_eliminacion DATETIME NULL COMMENT 'Fecha de la eliminación',
    PRIMARY KEY(cod_his, cod_mas),
    FOREIGN KEY (cod_mas) REFERENCES mascotas(cod_mas),
    FOREIGN KEY (id_vet) REFERENCES veterinarios(id_vet)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- Tabla de log de historiales para auditoría
CREATE TABLE historiales_log (
    log_id INT NOT NULL AUTO_INCREMENT,
    cod_his_fk INT NOT NULL,
    accion ENUM('CREACION', 'MODIFICACION', 'ELIMINACION') NOT NULL,
    id_usuario_modificador INT NOT NULL,
    fecha_modificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descripcion_anterior TEXT,
    tratamiento_anterior TEXT,
    PRIMARY KEY (log_id),
    INDEX idx_cod_his (cod_his_fk ASC),
    INDEX idx_usuario (id_usuario_modificador ASC)
);

-- Tabla de citas
CREATE TABLE citas (
    cod_cit INT(11) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Código único de la cita',
    fech_cit DATE NOT NULL COMMENT 'Fecha programada para la cita',
    hora TIME COMMENT 'Hora programada para la cita',
    cod_ser INT(11) COMMENT 'Servicio solicitado (FK)',
    id_vet INT(11) COMMENT 'Veterinario asignado (FK)',
    cod_mas INT(11) COMMENT 'Mascota para la cita (FK)',
    id_pro INT(11) NOT NULL COMMENT 'Usuario que solicita la cita (FK)',
    estado ENUM('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'REALIZADA', 'NO_ASISTIDA') NOT NULL DEFAULT 'PENDIENTE' COMMENT 'Estado actual de la cita',
    notas TEXT COMMENT 'Notas adicionales sobre la cita',
    FOREIGN KEY (cod_ser) REFERENCES servicios(cod_ser),
    FOREIGN KEY (id_pro) REFERENCES propietarios(id_pro),
    FOREIGN KEY (id_vet) REFERENCES veterinarios(id_vet),
    FOREIGN KEY (cod_mas) REFERENCES mascotas(cod_mas)
);

-- ========= INSERCIÓN DE DATOS =========

-- Insertar tipos de persona
INSERT INTO tipo_persona (id_tipo, tipo) VALUES
(1, 'Invitado/Tutor'),
(2, 'Medico'),
(3, 'Auxiliar Veterinario'),
(4, 'Administrativo');

-- Insertar roles
INSERT INTO rol (id_rol, rol) VALUES
(1, 'Administrador'),
(2, 'Veterinario'),
(3, 'Propietario');

-- Insertar usuarios
INSERT INTO usuarios (
    tipo_doc, id_usuario, nombre, apellido, ciudad, direccion, telefono,
    fecha_nacimiento, email, contrasena, id_tipo, id_rol
) VALUES
('C.C', 101, 'Ana', 'Ramírez', 'Bogotá', 'Calle 123 #45-67', '3001234567', '1990-05-15', 'ana@email.com', 'Hola1234?', 1, 1),
('C.C', 102, 'Luis', 'Martínez', 'Medellín', 'Carrera 9 #12-34', '3009876543', '1985-08-20', 'luis@email.com', 'Hola1234?', 1, 2),
('C.E', 103, 'Carlos', 'Gómez', 'Cali', 'Av. Siempreviva 742', '3012345678', '1992-12-01', 'carlos@email.com', 'Hola1234?', 1, 3),
('C.C', 104, 'Sofía', 'López', 'Bogotá', 'Calle 78 #10-45', '3112233445', '1988-11-22', 'sofia@email.com', 'Hola1234?', 4, 1);

-- Insertar administradores
INSERT INTO administradores (id_admin, cargo, fecha_ingreso) VALUES 
(101, 'Gerente General', '2022-01-10'),
(104, 'Coordinadora de Operaciones', '2025-05-26');

-- Insertar propietario
INSERT INTO propietarios (id_pro) VALUES 
(103);

-- Insertar veterinario
INSERT INTO veterinarios (id_vet, especialidad, horario) VALUES 
(102, 'Cirugía y diagnóstico', 'Lunes a Viernes 8:00am - 5:00pm');

-- Insertar mascotas
INSERT INTO mascotas (nom_mas, especie, raza, edad, genero, peso, id_pro, foto) VALUES
('Max', 'Perro', 'Labrador', 3.5, 'Macho', 28.5, 103, 'max.jpg'),
('Luna', 'Gato', 'Siamés', 2.0, 'Hembra', 4.2, 103, 'luna.jpg'),
('Rocky', 'Perro', 'Bulldog', 5.0, 'Macho', 22.0, 103, 'rocky.jpg');

-- Insertar servicios
INSERT INTO servicios (nom_ser, descrip_ser, precio) VALUES
('Consulta General', 'Evaluación médica general para cualquier tipo de mascota.', 45000.00),
('Vacunación Antirrábica', 'Aplicación de la vacuna antirrábica obligatoria.', 30000.00),
('Desparasitación', 'Tratamiento contra parásitos internos y externos.', 25000.00),
('Esterilización', 'Procedimiento quirúrgico para esterilizar al animal.', 70000.00),
('Baño y Peluquería', 'Servicio completo de higiene y estética para la mascota.', 35000.00);

-- Insertar citas
INSERT INTO citas (fech_cit, hora, cod_ser, id_vet, cod_mas, id_pro, estado) VALUES
('2025-05-10', '10:00:00', 1, 102, 2, 103, 'CONFIRMADA'),
('2025-05-12', '14:30:00', 2, 102, 2, 103, 'PENDIENTE');
