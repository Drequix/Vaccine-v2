IF OBJECT_ID('dbo.usp_GetRoles', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetRoles;
GO

CREATE PROCEDURE usp_GetRoles
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_Rol, Rol FROM Rol;
END
GO
