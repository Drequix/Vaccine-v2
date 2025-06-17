IF OBJECT_ID('dbo.usp_GetAdminDashboardStats', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetAdminDashboardStats;
GO

CREATE PROCEDURE dbo.usp_GetAdminDashboardStats
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        -- Calcula el total de pacientes sumando tutores y niños
        ((SELECT COUNT(*) FROM dbo.Tutor) + (SELECT COUNT(*) FROM dbo.Nino)) AS TotalPacientes,
        
        -- Cuenta las citas programadas para la fecha actual
        (SELECT COUNT(*) FROM dbo.Cita WHERE CONVERT(date, Fecha) = CONVERT(date, GETDATE())) AS CitasHoy,

        -- Cuenta el total de vacunas registradas en el historial
        (SELECT COUNT(*) FROM dbo.HistoricoVacunas) AS TotalVacunaciones,

        -- Placeholder para alertas. De momento devolvemos un valor fijo.
        -- La lógica real para esto se puede implementar más adelante.
        (SELECT 8) AS AlertasPendientes

END
GO
