-- =============================================
-- Description: Retrieves all provinces.
-- =============================================
IF OBJECT_ID('dbo.usp_GetProvinces', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetProvinces;
GO

CREATE PROCEDURE usp_GetProvinces
AS
BEGIN
    SET NOCOUNT ON;

    -- Selects all provinces, ordering by name.
    -- The frontend expects id_Provincia and Nombre.
    SELECT
        id_Provincia,
        Nombre
    FROM
        Provincia
    ORDER BY
        Nombre;
END
GO
