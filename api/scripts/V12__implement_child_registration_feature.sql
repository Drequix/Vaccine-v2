-- V12__implement_child_registration_feature.sql

-- Step 1: Modify the Nino table
-- Drop obsolete columns and add new ones for address, activation code, and future user linkage.
BEGIN TRANSACTION;
IF COL_LENGTH('dbo.Nino', 'PaisNacimiento') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Nino DROP COLUMN PaisNacimiento;
END
IF COL_LENGTH('dbo.Nino', 'id_CentroSaludAsignado') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Nino DROP COLUMN id_CentroSaludAsignado;
END
IF COL_LENGTH('dbo.Nino', 'DireccionResidencia') IS NULL
BEGIN
    ALTER TABLE dbo.Nino ADD DireccionResidencia NVARCHAR(255) NOT NULL DEFAULT 'N/A';
END
IF COL_LENGTH('dbo.Nino', 'CodigoActivacion') IS NULL
BEGIN
    ALTER TABLE dbo.Nino ADD CodigoActivacion NVARCHAR(10) NOT NULL DEFAULT 'PENDING';
    ALTER TABLE dbo.Nino ADD CONSTRAINT UQ_Nino_CodigoActivacion UNIQUE (CodigoActivacion);
END
IF COL_LENGTH('dbo.Nino', 'id_Usuario') IS NULL
BEGIN
    ALTER TABLE dbo.Nino ADD id_Usuario INT NULL;
    ALTER TABLE dbo.Nino ADD CONSTRAINT FK_Nino_Usuario FOREIGN KEY (id_Usuario) REFERENCES Usuario(id_Usuario);
END
COMMIT;
GO

-- Ensure CodigoIdentificacionPropio is nullable to support optional submission
ALTER TABLE dbo.Nino ALTER COLUMN CodigoIdentificacionPropio NVARCHAR(18) NULL;
GO

-- Step 2: Create the TutorNino bridge table
-- This table establishes a many-to-many relationship between Tutors and Ninos.
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TutorNino' and xtype='U')
BEGIN
    CREATE TABLE dbo.TutorNino (
        id_Tutor INT NOT NULL,
        id_Nino INT NOT NULL,
        CONSTRAINT PK_TutorNino PRIMARY KEY (id_Tutor, id_Nino),
        CONSTRAINT FK_TutorNino_Tutor FOREIGN KEY (id_Tutor) REFERENCES dbo.Tutor(id_Tutor),
        CONSTRAINT FK_TutorNino_Nino FOREIGN KEY (id_Nino) REFERENCES dbo.Nino(id_Nino)
    );
END
GO

-- Step 3: Recreate usp_RegisterNino stored procedure
-- This procedure now handles registering a child, generating a unique activation code,
-- and linking the child to the initial tutor.
CREATE OR ALTER PROCEDURE usp_RegisterNino
    @id_Tutor INT,
    @Nombres NVARCHAR(100),
    @Apellidos NVARCHAR(100),
    @Genero CHAR(1),
    @FechaNacimiento DATE,
    @DireccionResidencia NVARCHAR(255),
    @CodigoIdentificacionPropio NVARCHAR(18) = NULL -- Make optional
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NewNinoID INT;
    DECLARE @ActivationCode NVARCHAR(10);

    -- Generate a unique activation code
    WHILE 1=1
    BEGIN
        SET @ActivationCode = (
            SELECT TOP 1 SUBSTRING(REPLACE(CAST(NEWID() AS NVARCHAR(36)), '-', ''), 1, 8)
        );
        IF NOT EXISTS (SELECT 1 FROM dbo.Nino WHERE CodigoActivacion = @ActivationCode)
            BREAK;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Insert the new child record
        INSERT INTO dbo.Nino (Nombres, Apellidos, Genero, FechaNacimiento, DireccionResidencia, CodigoIdentificacionPropio, CodigoActivacion)
        VALUES (@Nombres, @Apellidos, @Genero, @FechaNacimiento, @DireccionResidencia, @CodigoIdentificacionPropio, @ActivationCode);

        SET @NewNinoID = SCOPE_IDENTITY();

        -- Link the child to the tutor
        INSERT INTO dbo.TutorNino (id_Tutor, id_Nino)
        VALUES (@id_Tutor, @NewNinoID);

        COMMIT TRANSACTION;

        -- Return the new child's information, including the activation code
        SELECT
            id_Nino = @NewNinoID,
            Nombres = @Nombres,
            Apellidos = @Apellidos,
            CodigoActivacion = @ActivationCode;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        -- Re-throw the error to be caught by the application
        THROW;
    END CATCH
END
GO

-- Step 4: Create usp_LinkNinoToTutor stored procedure
-- This allows a second tutor to link to an existing child using the activation code.
CREATE OR ALTER PROCEDURE usp_LinkNinoToTutor
    @id_Tutor INT,
    @CodigoActivacion NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_Nino INT;

    -- Find the child by activation code
    SELECT @id_Nino = id_Nino FROM dbo.Nino WHERE CodigoActivacion = @CodigoActivacion;

    IF @id_Nino IS NULL
    BEGIN
        THROW 50001, 'El código de activación no es válido.', 1;
        RETURN;
    END

    -- Check if the tutor is already linked to the child
    IF EXISTS (SELECT 1 FROM dbo.TutorNino WHERE id_Tutor = @id_Tutor AND id_Nino = @id_Nino)
    BEGIN
        THROW 50002, 'Ya estás vinculado a este niño.', 1;
        RETURN;
    END

    -- Link the tutor to the child
    INSERT INTO dbo.TutorNino (id_Tutor, id_Nino)
    VALUES (@id_Tutor, @id_Nino);

    -- Return the child's information
    SELECT id_Nino, Nombres, Apellidos, Genero, FechaNacimiento, DireccionResidencia
    FROM dbo.Nino
    WHERE id_Nino = @id_Nino;
END
GO

-- Step 5: Update usp_GetNinosByTutor to use the new TutorNino table
CREATE OR ALTER PROCEDURE usp_GetNinosByTutor
    @id_Tutor INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        n.id_Nino,
        n.Nombres,
        n.Apellidos,
        n.FechaNacimiento,
        n.Genero
    FROM
        dbo.Nino n
    INNER JOIN
        dbo.TutorNino tn ON n.id_Nino = tn.id_Nino
    WHERE
        tn.id_Tutor = @id_Tutor;
END
GO

PRINT 'Database schema updated successfully for modular child registration.';
GO
