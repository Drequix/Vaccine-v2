-- V14: Fix for the usp_GetAllUsers stored procedure.
-- This ensures the procedure exists and returns a valid, testable result.

IF OBJECT_ID('dbo.usp_GetAllUsers', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetAllUsers;
GO

CREATE PROCEDURE dbo.usp_GetAllUsers
AS
BEGIN
    SET NOCOUNT ON;

    -- Select user details with corrected column names
    SELECT
        U.id_Usuario AS ID,
        U.Email AS EMAIL,
        R.Rol AS ROLE, 
        E.Estado AS STATUS 
    FROM
        dbo.Usuario U
    LEFT JOIN
        dbo.Rol R ON U.id_Rol = R.id_Rol
    LEFT JOIN
        dbo.EstadoUsuario E ON U.id_Estado = E.id_Estado
    ORDER BY
        U.id_Usuario;

END
GO
