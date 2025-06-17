PRINT 'Creating Stored Procedure usp_GetNinosByTutor...';
GO

IF OBJECT_ID('dbo.usp_GetNinosByTutor', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE dbo.usp_GetNinosByTutor;
END
GO

IF OBJECT_ID('dbo.usp_GetNinosByTutor', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetNinosByTutor;
GO

CREATE PROCEDURE dbo.usp_GetNinosByTutor
    @id_Usuario INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_Tutor INT;

    -- Find the Tutor ID based on the User ID
    SELECT @id_Tutor = id_Tutor FROM dbo.Tutor WHERE id_Usuario = @id_Usuario;

    -- Validate Tutor exists
    IF @id_Tutor IS NULL
    BEGIN
        PRINT 'Error: Tutor for User ID ' + CAST(@id_Usuario AS VARCHAR(10)) + ' not found.';
        RETURN; -- Return empty result set
    END

    -- Select all children linked to the found Tutor ID
    SELECT 
        n.id_Nino,
        n.Nombres,
        n.Apellidos,
        n.FechaNacimiento,
        dbo.fn_CalculateAge(n.FechaNacimiento, GETDATE()) AS EdadActual,
        n.Genero,
        n.CodigoIdentificacionPropio,
        u_nino.Email AS NinoEmail
    FROM 
        dbo.Nino n
    JOIN 
        dbo.TutorNino tn ON n.id_Nino = tn.id_Nino
    LEFT JOIN
        dbo.Usuario u_nino ON n.id_Usuario = u_nino.id_Usuario
    WHERE 
        tn.id_Tutor = @id_Tutor
    ORDER BY
        n.Apellidos, n.Nombres; -- Optional: order the results

END;
GO

PRINT 'Stored Procedure usp_GetNinosByTutor created/updated successfully.';
GO

-- Example Usage:
/*
-- Assuming a Tutor with ID 1 exists and has linked children:
EXEC dbo.usp_GetNinosByTutor @id_Tutor = 1;

-- Assuming a Tutor with ID 999 does not exist or has no children:
EXEC dbo.usp_GetNinosByTutor @id_Tutor = 999;
*/
GO
