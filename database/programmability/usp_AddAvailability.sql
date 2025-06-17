-- =============================================
-- Author:      Cascade
-- Create date: 2024-06-14
-- Description: Adds a new availability slot for a vaccination center.
-- =============================================
IF OBJECT_ID('dbo.usp_AddAvailability', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_AddAvailability;
GO

CREATE PROCEDURE usp_AddAvailability
    @id_CentroVacunacion INT,
    @Fecha DATE,
    @HoraInicio TIME,
    @HoraFin TIME,
    @CuposTotales INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Assuming you have a table named DisponibilidadHoraria
    -- with the following columns:
    -- id_Disponibilidad (PK, INT, IDENTITY)
    -- id_CentroVacunacion (FK, INT)
    -- Fecha (DATE)
    -- HoraInicio (TIME)
    -- HoraFin (TIME)
    -- CuposTotales (INT)
    -- CuposDisponibles (INT)

    INSERT INTO dbo.DisponibilidadHoraria (id_Centro, Fecha, HoraInicio, HoraFin, CuposTotales, CuposDisponibles)
    VALUES (@id_CentroVacunacion, @Fecha, @HoraInicio, @HoraFin, @CuposTotales, @CuposTotales);
END
GO
