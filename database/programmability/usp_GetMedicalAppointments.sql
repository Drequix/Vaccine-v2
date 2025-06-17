PRINT 'Creating Stored Procedure usp_GetMedicalAppointments...';
GO

IF OBJECT_ID('dbo.usp_GetMedicalAppointments', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.usp_GetMedicalAppointments;
END
GO

IF OBJECT_ID('dbo.usp_GetMedicalAppointments', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetMedicalAppointments;
GO

CREATE PROCEDURE dbo.usp_GetMedicalAppointments
    @id_Medico INT
AS
BEGIN
    SET NOCOUNT ON;

    -- This procedure now filters appointments for a specific doctor
    SELECT
        c.id_Cita,
        c.Fecha AS FechaCita,
        c.Hora AS HoraCita,
        ec.Estado AS EstadoCita,
        c.Notas,
        n.id_Nino,
        n.Nombres AS NombrePaciente,
        n.Apellidos AS ApellidoPaciente,
        n.FechaNacimiento,
        t.Nombres AS NombreTutor,
        t.Apellidos AS ApellidoTutor,
        v.Nombre AS NombreVacuna,
        cv.Nombre AS NombreCentro
    FROM
        dbo.CitaVacunacion c
    JOIN
        dbo.Nino n ON c.id_Nino = n.id_Nino
    JOIN
        dbo.Tutor t ON n.id_Tutor = t.id_Tutor
    JOIN
        dbo.Vacuna v ON c.id_Vacuna = v.id_Vacuna
    JOIN
        dbo.CentroVacunacion cv ON c.id_CentroVacunacion = cv.id_CentroVacunacion
    JOIN
        dbo.EstadoCita ec ON c.id_EstadoCita = ec.id_Estado
    WHERE
        ec.Estado = 'Agendada'
        AND c.id_PersonalSalud = @id_Medico -- Filter by the doctor's ID
    ORDER BY
        c.Fecha, c.Hora;

END;
GO

PRINT 'Stored Procedure usp_GetMedicalAppointments created successfully.';
GO
