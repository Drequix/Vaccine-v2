IF OBJECT_ID('dbo.usp_GetAllVaccinationCenters', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetAllVaccinationCenters;
GO

CREATE PROCEDURE [dbo].[usp_GetAllVaccinationCenters]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        cv.id_CentroVacunacion,
        cv.NombreCentro,
        cv.NombreCorto,
        cv.Direccion,
        p.Nombre AS Provincia,
        m.Nombre AS Municipio,
        cv.Telefono,
        cv.Director,
        cv.Web,
        cv.Capacidad,
        e.NombreEstado
    FROM 
        dbo.CentroVacunacion cv
    LEFT JOIN 
        dbo.Provincia p ON cv.id_Provincia = p.id_Provincia
    LEFT JOIN 
        dbo.Municipio m ON cv.id_Municipio = m.id_Municipio
    LEFT JOIN 
        dbo.EstadoCentro e ON cv.id_Estado = e.id_Estado;

END;
GO
