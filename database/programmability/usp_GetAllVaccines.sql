IF OBJECT_ID('dbo.usp_GetAllVaccines', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetAllVaccines;
GO

CREATE PROCEDURE usp_GetAllVaccines
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        id_Vacuna,
        id_Fabricante,
        Nombre,
        DosisLimite,
        Tipo,
        Descripcion
    FROM 
        Vacuna;

END;
GO
