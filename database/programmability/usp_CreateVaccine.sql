IF OBJECT_ID('dbo.usp_CreateVaccine', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_CreateVaccine;
GO

CREATE PROCEDURE usp_CreateVaccine
    @id_Fabricante INT,
    @Nombre NVARCHAR(100),
    @DosisLimite INT,
    @Tipo NVARCHAR(50),
    @Descripcion NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Vacuna (id_Fabricante, Nombre, DosisLimite, Tipo, Descripcion)
    VALUES (@id_Fabricante, @Nombre, @DosisLimite, @Tipo, @Descripcion);

    SELECT SCOPE_IDENTITY() AS id_Vacuna;
END
GO
