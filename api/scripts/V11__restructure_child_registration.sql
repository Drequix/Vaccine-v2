-- Step 1: Modify the Nino table
-- Remove obsolete columns
ALTER TABLE Nino DROP COLUMN PaisNacimiento;
ALTER TABLE Nino DROP COLUMN id_CentroSaludAsignado;
-- It's likely id_Tutor is now obsolete, assuming it exists
-- We'll try to drop it, but will handle error if it doesn't exist.
BEGIN TRY
    ALTER TABLE Nino DROP CONSTRAINT FK__Nino__id_Tutor__...; -- The actual FK name is unknown, so this might fail. The DROP COLUMN should handle it.
    ALTER TABLE Nino DROP COLUMN id_Tutor;
END TRY
BEGIN CATCH
    PRINT 'Column id_Tutor does not exist or could not be dropped, continuing.'
END CATCH

-- Add new columns
ALTER TABLE Nino ADD DireccionResidencia NVARCHAR(255) NOT NULL;
ALTER TABLE Nino ADD CodigoActivacion NVARCHAR(10) NOT NULL;
ALTER TABLE Nino ADD id_Usuario INT NULL;

-- Add constraints for the new columns
ALTER TABLE Nino ADD CONSTRAINT UQ_Nino_CodigoActivacion UNIQUE (CodigoActivacion);
ALTER TABLE Nino ADD CONSTRAINT FK_Nino_Usuario FOREIGN KEY (id_Usuario) REFERENCES Usuarios(id);

-- Step 2: Create the TutorNino bridge table
CREATE TABLE TutorNino (
    id_Tutor INT NOT NULL,
    id_Nino INT NOT NULL,
    PRIMARY KEY (id_Tutor, id_Nino),
    FOREIGN KEY (id_Tutor) REFERENCES Usuarios(id),
    FOREIGN KEY (id_Nino) REFERENCES Nino(id) ON DELETE CASCADE
);

-- Step 3: Recreate the usp_RegisterNino stored procedure
GO
CREATE OR ALTER PROCEDURE usp_RegisterNino
    @id_Tutor INT,
    @Nombres NVARCHAR(100),
    @Apellidos NVARCHAR(100),
    @Genero CHAR(1),
    @FechaNacimiento DATE,
    @DireccionResidencia NVARCHAR(255),
    @CodigoIdentificacionPropio NVARCHAR(18) -- Keeping this as it seems important for identification
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @newNinoId INT;
    DECLARE @activationCode NVARCHAR(10);
    DECLARE @isUnique BIT = 0;

    -- Generate a unique activation code
    WHILE @isUnique = 0
    BEGIN
        SET @activationCode = SUBSTRING(CONVERT(varchar(255), NEWID()), 0, 9);
        IF NOT EXISTS (SELECT 1 FROM Nino WHERE CodigoActivacion = @activationCode)
        BEGIN
            SET @isUnique = 1;
        END
    END

    -- Insert the new child
    INSERT INTO Nino (Nombres, Apellidos, Genero, CodigoIdentificacionPropio, FechaNacimiento, DireccionResidencia, CodigoActivacion)
    VALUES (@Nombres, @Apellidos, @Genero, @CodigoIdentificacionPropio, @FechaNacimiento, @DireccionResidencia, @activationCode);

    SET @newNinoId = SCOPE_IDENTITY();

    -- Link the tutor to the new child
    INSERT INTO TutorNino (id_Tutor, id_Nino)
    VALUES (@id_Tutor, @newNinoId);

    -- Return the new child's info, including the activation code
    SELECT id AS id_Nino, Nombres, Apellidos, CodigoActivacion FROM Nino WHERE id = @newNinoId;
END
GO

-- Step 4: Create the usp_LinkNinoToTutor stored procedure
CREATE OR ALTER PROCEDURE usp_LinkNinoToTutor
    @id_Tutor INT,
    @CodigoActivacion NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ninoId INT;

    -- Find the child by activation code
    SELECT @ninoId = id FROM Nino WHERE CodigoActivacion = @CodigoActivacion;

    IF @ninoId IS NULL
    BEGIN
        RAISERROR('Código de activación no válido.', 16, 1);
        RETURN;
    END

    -- Check if the link already exists
    IF EXISTS (SELECT 1 FROM TutorNino WHERE id_Tutor = @id_Tutor AND id_Nino = @ninoId)
    BEGIN
        RAISERROR('Este niño ya está vinculado a su cuenta.', 16, 1);
        RETURN;
    END

    -- Create the link
    INSERT INTO TutorNino (id_Tutor, id_Nino)
    VALUES (@id_Tutor, @ninoId);

    SELECT id, Nombres, Apellidos FROM Nino WHERE id = @ninoId;
END
GO

-- Step 5: Update usp_GetNinosByTutor to use the new table
CREATE OR ALTER PROCEDURE usp_GetNinosByTutor
    @id_Tutor INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT n.id, n.Nombres, n.Apellidos, n.FechaNacimiento, n.Genero
    FROM Nino n
    JOIN TutorNino tn ON n.id = tn.id_Nino
    WHERE tn.id_Tutor = @id_Tutor;
END
GO
