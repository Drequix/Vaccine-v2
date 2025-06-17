PRINT 'Creating Stored Procedure usp_GetPatientHistory...';
GO

IF OBJECT_ID('dbo.usp_GetPatientHistory', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.usp_GetPatientHistory;
END
GO

IF OBJECT_ID('dbo.usp_GetPatientHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetPatientHistory;
GO

CREATE PROCEDURE dbo.usp_GetPatientHistory
    @id_Nino INT
AS
BEGIN
    SET NOCOUNT ON;

    -- First result set: Patient Details
    SELECT
        n.id_Nino,
        n.Nombres,
        n.Apellidos,
        n.FechaNacimiento,
        n.Sexo,
        t.Nombres AS NombreTutor,
        t.Apellidos AS ApellidoTutor,
        t.Telefono,
        t.Email
    FROM
        dbo.Nino n
    JOIN
        dbo.Tutor t ON n.id_Tutor = t.id_Tutor
    WHERE
        n.id_Nino = @id_Nino;

    -- Second result set: Vaccination Records
    SELECT
        h.id_Historial,
        h.FechaVacunacion,
        v.Nombre AS NombreVacuna,
        h.Dosis,
        l.NumeroLote,
        cv.Nombre AS NombreCentro
    FROM
        dbo.HistorialVacunacion h
    JOIN
        dbo.Vacuna v ON h.id_Vacuna = v.id_Vacuna
    JOIN
        dbo.Lote l ON h.id_Lote = l.id_LoteVacuna
    JOIN
        dbo.CentroVacunacion cv ON h.id_CentroVacunacion = cv.id_CentroVacunacion
    WHERE
        h.id_Nino = @id_Nino
    ORDER BY
        h.FechaVacunacion DESC;

END;
GO

PRINT 'Stored Procedure usp_GetPatientHistory created successfully.';
GO
