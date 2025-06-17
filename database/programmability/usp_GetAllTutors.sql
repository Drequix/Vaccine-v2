IF OBJECT_ID('dbo.usp_GetAllTutors', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetAllTutors;
GO

CREATE PROCEDURE dbo.usp_GetAllTutors
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        t.id_Tutor,
        u.id_Usuario,
        t.Nombres,
        t.Apellidos,
        t.Cedula_Tutor,
        t.Telefono,
        t.Direccion,
        t.Email
    FROM 
        Tutor t
    INNER JOIN 
        Usuario u ON t.id_Usuario = u.id_Usuario
    WHERE
        u.id_Estado = 1; -- Assuming 1 is 'Activo'

END;
GO
