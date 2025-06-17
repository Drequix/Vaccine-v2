IF OBJECT_ID('dbo.usp_GetActiveVaccineLots', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetActiveVaccineLots;
GO

CREATE PROCEDURE dbo.usp_GetActiveVaccineLots
    @id_Vacuna INT = NULL,
    @id_CentroVacunacion INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        l.id_LoteVacuna,
        l.NumeroLote,
        v.Nombre AS NombreVacuna,
        f.Fabricante AS NombreFabricante,
        l.FechaCaducidad,
        l.CantidadDisponible
    FROM 
        dbo.Lote l
    JOIN 
        dbo.Vacuna v ON l.id_VacunaCatalogo = v.id_Vacuna
    JOIN 
        dbo.Fabricante f ON v.id_Fabricante = f.id_Fabricante
    WHERE 
        l.CantidadDisponible > 0
        AND l.FechaCaducidad >= CAST(GETDATE() AS DATE)
        AND (@id_Vacuna IS NULL OR l.id_VacunaCatalogo = @id_Vacuna)
        AND (@id_CentroVacunacion IS NULL OR l.id_CentroVacunacion = @id_CentroVacunacion)
    ORDER BY
        v.Nombre, l.FechaCaducidad;

END;
GO


*/
GO
