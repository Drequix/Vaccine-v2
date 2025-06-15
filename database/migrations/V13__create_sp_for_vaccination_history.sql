IF OBJECT_ID('usp_GetVaccinationHistory', 'P') IS NOT NULL
    DROP PROCEDURE usp_GetVaccinationHistory;
GO

CREATE PROCEDURE usp_GetVaccinationHistory
    @PersonId INT,
    @PersonType NVARCHAR(10) -- 'Tutor' or 'Nino'
AS
BEGIN
    SET NOCOUNT ON;

    -- Asumimos que 'Completada' es el estado para una vacuna que ha sido administrada.
    DECLARE @id_EstadoCompletada INT;
    SELECT @id_EstadoCompletada = id_EstadoCita FROM EstadoCita WHERE NombreEstado = 'Completada';

    IF @PersonType = 'Tutor'
    BEGIN
        SELECT
            C.id_Cita,
            V.Nombre AS NombreVacuna,
            C.Fecha AS FechaVacunacion,
            CV.NombreCentro AS NombreCentroVacunacion,
            -- Marcador de posición para información extendida, se necesitará aclaración del esquema
            'Dr. No Disponible' AS NombreMedico,
            'N/A' AS Lote,
            'N/A' AS Dosis
        FROM
            Cita AS C
        INNER JOIN
            Vacuna AS V ON C.id_Vacuna = V.id_Vacuna
        INNER JOIN
            CentroVacunacion AS CV ON C.id_CentroVacunacion = CV.id_CentroVacunacion
        WHERE
            C.id_Tutor = @PersonId
            AND C.id_EstadoCita = @id_EstadoCompletada;
    END
    ELSE IF @PersonType = 'Nino'
    BEGIN
        SELECT
            C.id_Cita,
            V.Nombre AS NombreVacuna,
            C.Fecha AS FechaVacunacion,
            CV.NombreCentro AS NombreCentroVacunacion,
            -- Marcador de posición para información extendida, se necesitará aclaración del esquema
            'Dr. No Disponible' AS NombreMedico,
            'N/A' AS Lote,
            'N/A' AS Dosis
        FROM
            Cita AS C
        INNER JOIN
            Vacuna AS V ON C.id_Vacuna = V.id_Vacuna
        INNER JOIN
            CentroVacunacion AS CV ON C.id_CentroVacunacion = CV.id_CentroVacunacion
        WHERE
            C.id_Nino = @PersonId
            AND C.id_EstadoCita = @id_EstadoCompletada;
    END
END
GO
