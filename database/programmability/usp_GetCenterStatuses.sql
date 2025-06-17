-- =============================================
-- Description: Retrieves all possible statuses for a vaccination center.
-- =============================================
IF OBJECT_ID('dbo.usp_GetCenterStatuses', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetCenterStatuses;
GO

CREATE PROCEDURE usp_GetCenterStatuses
AS
BEGIN
    SET NOCOUNT ON;

    -- The frontend expects id_Estado and NombreEstado.
    -- The table EstadosCentro has id_Estado and NombreEstado.
    -- This SP selects the correct columns to match the frontend's data model.
    SELECT
        id_Estado,
        NombreEstado
    FROM
        EstadosCentro;
END
GO
