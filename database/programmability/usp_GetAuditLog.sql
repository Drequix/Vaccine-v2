-- =============================================
-- Author:      <Author, cascade>
-- Create date: <Create Date, 17/06/2024>
-- Description: <Description, Obtiene todos los registros de la bitácora de auditoría.>
-- =============================================
IF OBJECT_ID('dbo.usp_GetAuditLog', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetAuditLog;
GO

CREATE PROCEDURE usp_GetAuditLog
AS
BEGIN
    SET NOCOUNT ON;

    -- Este procedimiento asume que existe una tabla llamada BitacoraAuditoria.
    -- Si no existe, puedes crearla con un script como el siguiente:
    /*
    CREATE TABLE BitacoraAuditoria (
        id_Log INT PRIMARY KEY IDENTITY(1,1),
        FechaHora DATETIME DEFAULT GETDATE(),
        Usuario NVARCHAR(255), -- Email o nombre del usuario que realiza la acción
        Accion NVARCHAR(50), -- CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT
        Recurso NVARCHAR(100), -- El tipo de entidad afectada: Paciente, Cita, etc.
        id_Recurso NVARCHAR(100), -- El ID del recurso afectado
        Detalles NVARCHAR(MAX), -- Descripción de la acción
        DireccionIP NVARCHAR(50),
        UserAgent NVARCHAR(500)
    );
    */

    -- Si la tabla no existe, devolvemos un conjunto de resultados vacío para evitar un error.
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BitacoraAuditoria' and xtype='U')
    BEGIN
        SELECT 
            0 AS id,
            GETDATE() AS timestamp,
            'Sistema' AS [user],
            'INFO' AS action,
            'BitacoraAuditoria' AS resource,
            'N/A' AS resourceId,
            'La tabla BitacoraAuditoria no existe. Por favor, créela para ver los registros.' AS details,
            'N/A' AS ipAddress,
            'N/A' AS userAgent
        WHERE 1=0; -- Devuelve una estructura vacía
        RETURN;
    END

    -- Seleccionar y devolver los registros de la bitácora
    SELECT
        id_Log AS id,
        FechaHora AS timestamp,
        Usuario AS [user],
        Accion AS action,
        Recurso AS resource,
        id_Recurso AS resourceId,
        Detalles AS details,
        DireccionIP AS ipAddress,
        UserAgent AS userAgent
    FROM
        BitacoraAuditoria
    ORDER BY
        FechaHora DESC;

END
GO
