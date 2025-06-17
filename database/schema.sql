-- SQL Server Schema for Vaccination System - ASCII Identifiers - Idempotent

-- Drop tables in reverse order of creation due to dependencies, or handle dependencies in each drop
-- For simplicity here, we'll drop and recreate, assuming sqlcmd handles batch execution correctly with GO.

PRINT 'Disabling all constraints and dropping all tables...';
GO

-- Use a cursor to drop all foreign key constraints
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += 'ALTER TABLE ' + QUOTENAME(cs.name) + '.' + QUOTENAME(ct.name) + ' DROP CONSTRAINT ' + QUOTENAME(fk.name) + ';' + CHAR(13) + CHAR(10)
FROM sys.foreign_keys AS fk
INNER JOIN sys.tables AS ct ON fk.parent_object_id = ct.object_id
INNER JOIN sys.schemas AS cs ON ct.schema_id = cs.schema_id;
EXEC sp_executesql @sql;
GO

-- Use a cursor to drop all tables
DECLARE @sql2 NVARCHAR(MAX) = N'';
SELECT @sql2 += 'DROP TABLE ' + QUOTENAME(cs.name) + '.' + QUOTENAME(ct.name) + ';' + CHAR(13) + CHAR(10)
FROM sys.tables AS ct
INNER JOIN sys.schemas AS cs ON ct.schema_id = cs.schema_id;
EXEC sp_executesql @sql2;
GO

PRINT 'Creating tables...';
GO

-- Table: Rol
CREATE TABLE Rol (
    id_Rol INT IDENTITY(1,1) PRIMARY KEY,
    Rol NVARCHAR(50) NOT NULL UNIQUE
);
GO

-- Table: EstadoUsuario
CREATE TABLE EstadoUsuario (
    id_Estado INT IDENTITY(1,1) PRIMARY KEY,
    Estado NVARCHAR(50) NOT NULL UNIQUE
);
GO

-- Table: EstadoCita
CREATE TABLE EstadoCita (
    id_Estado INT IDENTITY(1,1) PRIMARY KEY,
    Estado NVARCHAR(50) NOT NULL UNIQUE -- e.g. 'Agendada', 'Asistida', 'Cancelada'
);
GO

-- Table: EstadoCentro (Corrected from Plural)
CREATE TABLE EstadoCentro (
    id_Estado INT IDENTITY(1,1) PRIMARY KEY,
    NombreEstado NVARCHAR(50) NOT NULL UNIQUE
);
GO

-- Table: CentroVacunacion
CREATE TABLE CentroVacunacion (
    id_CentroVacunacion INT IDENTITY(1,1) PRIMARY KEY,
    NombreCentro NVARCHAR(100) NOT NULL,
    NombreCorto NVARCHAR(50),
    Direccion NVARCHAR(200) NOT NULL,
    id_Provincia INT NOT NULL,
    id_Municipio INT NOT NULL,
    Telefono NVARCHAR(20),
    Director NVARCHAR(100),
    Web NVARCHAR(100),
    Capacidad INT,
    id_Estado INT NOT NULL
);
GO

-- Table: Usuario
CREATE TABLE Usuario (
    id_Usuario INT IDENTITY(1,1) PRIMARY KEY,
    id_Rol INT NOT NULL,
    id_Estado INT NOT NULL,
    Cedula_Usuario NVARCHAR(15) UNIQUE,
    Email NVARCHAR(100) UNIQUE,
    Clave NVARCHAR(255) NOT NULL, -- Store hashed passwords
    id_CentroVacunacion INT, -- Optional: Link user to a specific vaccination center
    CONSTRAINT FK_Usuario_Rol FOREIGN KEY (id_Rol) REFERENCES Rol(id_Rol),
    CONSTRAINT FK_Usuario_EstadoUsuario FOREIGN KEY (id_Estado) REFERENCES EstadoUsuario(id_Estado),
    CONSTRAINT FK_Usuario_CentroVacunacion FOREIGN KEY (id_CentroVacunacion) REFERENCES CentroVacunacion(id_CentroVacunacion)
);
GO

-- Table: Tutor
CREATE TABLE Tutor (
    id_Tutor INT IDENTITY(1,1) PRIMARY KEY,
    id_Usuario INT UNIQUE,
    Cedula_Tutor NVARCHAR(15) UNIQUE NOT NULL,
    Nombres NVARCHAR(100) NOT NULL,
    Apellidos NVARCHAR(100) NOT NULL,
    Telefono NVARCHAR(20),
    Email NVARCHAR(100),
    Direccion NVARCHAR(200),
    CONSTRAINT FK_Tutor_Usuario FOREIGN KEY (id_Usuario) REFERENCES Usuario(id_Usuario) ON DELETE SET NULL
);
GO

-- Table: Provincia
CREATE TABLE Provincia (
    id_Provincia INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL UNIQUE
);
GO

-- Table: Municipio
CREATE TABLE Municipio (
    id_Municipio INT IDENTITY(1,1) PRIMARY KEY,
    id_Provincia INT NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    CONSTRAINT FK_Municipio_Provincia FOREIGN KEY (id_Provincia) REFERENCES Provincia(id_Provincia),
    CONSTRAINT UQ_Municipio_Provincia_Nombre UNIQUE (id_Provincia, Nombre)
);
GO

-- Add FKs to CentroVacunacion now that dependency tables are created
ALTER TABLE CentroVacunacion ADD CONSTRAINT FK_CentroVacunacion_Provincia FOREIGN KEY (id_Provincia) REFERENCES Provincia(id_Provincia);
ALTER TABLE CentroVacunacion ADD CONSTRAINT FK_CentroVacunacion_Municipio FOREIGN KEY (id_Municipio) REFERENCES Municipio(id_Municipio);
ALTER TABLE CentroVacunacion ADD CONSTRAINT FK_CentroVacunacion_Estado FOREIGN KEY (id_Estado) REFERENCES EstadoCentro(id_Estado);
GO

-- Table: Nino (Child) - Changed from Niño
CREATE TABLE Nino (
    id_Nino INT IDENTITY(1,1) PRIMARY KEY, -- Changed from id_Niño
    id_Usuario INT UNIQUE,
    Nombres NVARCHAR(100) NOT NULL,
    Apellidos NVARCHAR(100) NOT NULL,
    FechaNacimiento DATE NOT NULL,
    Genero CHAR(1) CHECK (Genero IN ('M', 'F', 'O')), -- M: Male, F: Female, O: Other
    Email NVARCHAR(100),
    DireccionResidencia NVARCHAR(200),
    CodigoIdentificacionPropio NVARCHAR(20) UNIQUE,
    PaisNacimiento NVARCHAR(100),
    id_CentroSaludAsignado INT,
    CONSTRAINT FK_Nino_Usuario FOREIGN KEY (id_Usuario) REFERENCES Usuario(id_Usuario) ON DELETE SET NULL,
    CONSTRAINT FK_Nino_CentroSaludAsignado FOREIGN KEY (id_CentroSaludAsignado) REFERENCES CentroVacunacion(id_CentroVacunacion) ON DELETE SET NULL
);
GO

-- Table: TutorNino (Tutor-Child Relationship) - Changed from TutorNiño
CREATE TABLE TutorNino (
    id_Tutor INT NOT NULL,
    id_Nino INT NOT NULL, -- Changed from id_Niño
    CONSTRAINT PK_TutorNino PRIMARY KEY (id_Tutor, id_Nino), -- Changed from id_Niño
    CONSTRAINT FK_TutorNino_Tutor FOREIGN KEY (id_Tutor) REFERENCES Tutor(id_Tutor) ON DELETE CASCADE,
    CONSTRAINT FK_TutorNino_Nino FOREIGN KEY (id_Nino) REFERENCES Nino(id_Nino) ON DELETE CASCADE -- Changed from id_Niño and Niño
);
GO

-- Table: Fabricante (Manufacturer)
CREATE TABLE Fabricante (
    id_Fabricante INT IDENTITY(1,1) PRIMARY KEY,
    Fabricante NVARCHAR(100) NOT NULL UNIQUE
);
GO

-- Table: Vacuna (Vaccine Catalog)
CREATE TABLE Vacuna (
    id_Vacuna INT IDENTITY(1,1) PRIMARY KEY,
    id_Fabricante INT NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    DosisLimite INT,
    Tipo NVARCHAR(50),
    Descripcion NVARCHAR(MAX),
    CONSTRAINT FK_Vacuna_Fabricante FOREIGN KEY (id_Fabricante) REFERENCES Fabricante(id_Fabricante)
);
GO

-- Table: Lote (Vaccine Lot)
CREATE TABLE Lote (
    id_LoteVacuna INT IDENTITY(1,1) PRIMARY KEY,
    id_VacunaCatalogo INT NOT NULL,
    id_CentroVacunacion INT NOT NULL, -- Added FK to CentroVacunacion
    NumeroLote NVARCHAR(50) NOT NULL,
    FechaCaducidad DATE NOT NULL,
    CantidadInicial INT NOT NULL CHECK (CantidadInicial >= 0),
    CantidadDisponible INT NOT NULL CHECK (CantidadDisponible >= 0),
    CONSTRAINT UQ_Lote_VacunaCatalogo_NumeroLote UNIQUE (id_VacunaCatalogo, NumeroLote),
    CONSTRAINT FK_Lote_Vacuna FOREIGN KEY (id_VacunaCatalogo) REFERENCES Vacuna(id_Vacuna),
    CONSTRAINT FK_Lote_CentroVacunacion FOREIGN KEY (id_CentroVacunacion) REFERENCES CentroVacunacion(id_CentroVacunacion),
    CONSTRAINT CK_Lote_CantidadDisponible CHECK (CantidadDisponible <= CantidadInicial)
);
GO

-- Table: DisponibilidadHoraria (Availability Schedule) - ADDED MISSING TABLE
CREATE TABLE DisponibilidadHoraria (
    id_Disponibilidad INT IDENTITY(1,1) PRIMARY KEY,
    id_CentroVacunacion INT NOT NULL,
    Fecha DATE NOT NULL,
    HoraInicio TIME NOT NULL,
    HoraFin TIME NOT NULL,
    CuposTotales INT NOT NULL,
    CuposDisponibles INT NOT NULL,
    CONSTRAINT FK_Disponibilidad_CentroVacunacion FOREIGN KEY (id_CentroVacunacion) REFERENCES CentroVacunacion(id_CentroVacunacion) ON DELETE CASCADE,
    CONSTRAINT CK_Disponibilidad_Cupos CHECK (CuposDisponibles <= CuposTotales AND CuposDisponibles >= 0),
    CONSTRAINT UQ_Disponibilidad_Horario UNIQUE (id_CentroVacunacion, Fecha, HoraInicio)
);
GO

-- Table: CitaVacunacion (Vaccination Appointment)
CREATE TABLE CitaVacunacion (
    id_Cita INT IDENTITY(1,1) PRIMARY KEY,
    id_Nino INT NOT NULL, -- Changed from id_Niño
    id_Vacuna INT NOT NULL,
    id_PersonalSalud INT, -- Health personnel user ID
    id_UsuarioRegistraCita INT NOT NULL, -- User ID who registered the appointment
    id_CentroVacunacion INT NOT NULL,
    Fecha DATE NOT NULL,
    Hora TIME,
    id_EstadoCita INT NOT NULL,
    RequiereTutor BIT DEFAULT 0, -- 0 for False, 1 for True
    NombreCompletoPersonalAplicado NVARCHAR(100),
    id_LoteAplicado INT,
    CONSTRAINT FK_CitaVacunacion_Nino FOREIGN KEY (id_Nino) REFERENCES Nino(id_Nino) ON DELETE CASCADE, -- Changed from id_Niño and Niño
    CONSTRAINT FK_CitaVacunacion_Vacuna FOREIGN KEY (id_Vacuna) REFERENCES Vacuna(id_Vacuna),
    CONSTRAINT FK_CitaVacunacion_PersonalSalud FOREIGN KEY (id_PersonalSalud) REFERENCES Usuario(id_Usuario) ON DELETE SET NULL,
    CONSTRAINT FK_CitaVacunacion_UsuarioRegistraCita FOREIGN KEY (id_UsuarioRegistraCita) REFERENCES Usuario(id_Usuario),
    CONSTRAINT FK_CitaVacunacion_CentroVacunacion FOREIGN KEY (id_CentroVacunacion) REFERENCES CentroVacunacion(id_CentroVacunacion),
    CONSTRAINT FK_CitaVacunacion_EstadoCita FOREIGN KEY (id_EstadoCita) REFERENCES EstadoCita(id_Estado),
    CONSTRAINT FK_CitaVacunacion_Lote FOREIGN KEY (id_LoteAplicado) REFERENCES Lote(id_LoteVacuna) ON DELETE SET NULL
);
GO

-- Table: Vacunacion (Actual vaccination event, linking child, vaccine, lot, etc.)
CREATE TABLE Vacunacion (
    id_Vacunacion INT IDENTITY(1,1) PRIMARY KEY,
    id_Cita INT UNIQUE NOT NULL, -- The appointment that led to this vaccination
    id_Nino INT NOT NULL,
    id_Vacuna INT NOT NULL,
    id_Lote INT NOT NULL,
    id_CentroVacunacion INT NOT NULL,
    id_PersonalSalud INT NOT NULL,
    FechaHoraAplicacion DATETIME NOT NULL,
    Dosis VARCHAR(50),
    NotasAdicionales NVARCHAR(MAX),
    Alergias NVARCHAR(MAX),
    CONSTRAINT FK_Vacunacion_Cita FOREIGN KEY (id_Cita) REFERENCES CitaVacunacion(id_Cita) ON DELETE NO ACTION,
    CONSTRAINT FK_Vacunacion_Nino FOREIGN KEY (id_Nino) REFERENCES Nino(id_Nino) ON DELETE CASCADE,
    CONSTRAINT FK_Vacunacion_Vacuna FOREIGN KEY (id_Vacuna) REFERENCES Vacuna(id_Vacuna),
    CONSTRAINT FK_Vacunacion_Lote FOREIGN KEY (id_Lote) REFERENCES LoteVacuna(id_LoteVacuna),
    CONSTRAINT FK_Vacunacion_Centro FOREIGN KEY (id_CentroVacunacion) REFERENCES CentroVacunacion(id_CentroVacunacion),
    CONSTRAINT FK_Vacunacion_Personal FOREIGN KEY (id_PersonalSalud) REFERENCES Usuario(id_Usuario)
);
GO

-- Table: HistoricoCita (Appointment History Log)
CREATE TABLE HistoricoCita (
    id_HistoricoCita INT IDENTITY(1,1) PRIMARY KEY,
    id_Cita INT NOT NULL,
    Vacuna NVARCHAR(100),
    NombreCompletoPersonal NVARCHAR(100),
    CentroMedico NVARCHAR(100),
    Fecha DATE,
    Hora TIME,
    Notas NVARCHAR(MAX),
    CONSTRAINT FK_HistoricoCita_Cita FOREIGN KEY (id_Cita) REFERENCES CitaVacunacion(id_Cita) ON DELETE CASCADE
);
GO

PRINT 'Creating BitacoraAuditoria table...';
GO

-- Table: BitacoraAuditoria (Audit Log)
CREATE TABLE BitacoraAuditoria (
    id_Log INT PRIMARY KEY IDENTITY(1,1),
    FechaHora DATETIME DEFAULT GETDATE(),
    Usuario NVARCHAR(255), -- Email o nombre del usuario que realiza la acción
    Accion NVARCHAR(50), -- CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT
    Recurso NVARCHAR(100), -- El tipo de entidad afectada: Paciente, Cita, etc.
    id_Recurso NVARCHAR(100), -- El ID del recurso afectado
    Detalles NVARCHAR(MAX), -- Descripción de la acción
    DireccionIP NVARCHAR(50),
    UserAgent NVARCHAR(500)
);
GO

PRINT 'Inserting initial data...';
GO

-- Initial Data (Examples)
INSERT INTO Rol (Rol) VALUES
    ('Administrador'),
    ('Medico'),
    ('Enfermera'),
    ('Digitador'),
    ('Tutor');
GO

INSERT INTO EstadoUsuario (Estado) VALUES
    ('Activo'),
    ('Inactivo'),
    ('Bloqueado'),
    ('Pendiente Verificacion');
GO

INSERT INTO EstadoCita (Estado) VALUES
    ('Agendada'),
    ('Confirmada'),
    ('Asistida'),
    ('Cancelada por Paciente'),
    ('Cancelada por Centro'),
    ('No Asistio'),
    ('Reprogramada');
GO

INSERT INTO EstadosCentro (NombreEstado) VALUES
    ('Activo'),
    ('Inactivo'),
    ('En Mantenimiento');
GO

-- Example provinces and municipalities for Dominican Republic
INSERT INTO Provincia (Nombre) VALUES
('Distrito Nacional'), ('Santo Domingo'), ('Santiago'), ('La Altagracia');
GO

INSERT INTO Municipio (id_Provincia, Nombre) VALUES
(1, 'Distrito Nacional'),
(2, 'Santo Domingo Este'),
(2, 'Santo Domingo Oeste'),
(2, 'Santo Domingo Norte'),
(3, 'Santiago de los Caballeros'),
(4, 'Higüey');
GO

PRINT 'Database schema created successfully with initial data.';
GO
