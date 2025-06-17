IF OBJECT_ID('dbo.usp_GetAdminDashboardStats', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetAdminDashboardStats;
GO

CREATE PROCEDURE dbo.usp_GetAdminDashboardStats
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalPacientes INT;
    DECLARE @CitasHoy INT;
    DECLARE @TotalVacunaciones INT;
    DECLARE @AlertasPendientes INT;

    -- 1. Calcular el total de pacientes (tutores + niños)
    SELECT @TotalPacientes = COUNT(*) FROM (SELECT id_Tutor FROM Tutor UNION ALL SELECT id_Nino FROM Nino) AS Pacientes;

    -- 2. Calcular el número de citas programadas para hoy
    SELECT @CitasHoy = COUNT(id_Cita) 
    FROM CitaVacunacion
    WHERE CONVERT(date, Fecha) = CONVERT(date, GETDATE())
      AND id_EstadoCita = (SELECT id_EstadoCita FROM EstadoCita WHERE Estado = 'Programada');

    -- 3. Calcular el total de vacunaciones completadas
    SELECT @TotalVacunaciones = COUNT(id_RegistroVacunacion) 
    FROM RegistroVacunacion;

    -- 4. Calcular alertas pendientes (ej. esquemas incompletos o citas pendientes)
    -- Por ahora, contaremos las citas que no están completadas ni canceladas
    SELECT @AlertasPendientes = COUNT(id_Cita)
    FROM CitaVacunacion
    WHERE id_EstadoCita NOT IN (
        SELECT id_EstadoCita FROM EstadoCita WHERE Estado IN ('Completada', 'Cancelada')
    );

    -- Devolver los resultados en una sola fila
    SELECT 
        @TotalPacientes AS TotalPacientes,
        @CitasHoy AS CitasHoy,
        @TotalVacunaciones AS TotalVacunaciones,
        @AlertasPendientes AS AlertasPendientes;
END
GO

END
GO
