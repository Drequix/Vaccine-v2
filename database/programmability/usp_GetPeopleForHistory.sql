-- =============================================
-- Description: Retrieves the tutor and their associated children for the vaccination history page.
-- =============================================
IF OBJECT_ID('dbo.usp_GetPeopleForHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetPeopleForHistory;
GO

CREATE PROCEDURE usp_GetPeopleForHistory
    @id_Usuario INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Select the Tutor's own information by joining with the Tutor table
    SELECT
        t.id_Tutor AS PersonId,
        t.Nombres + ' ' + t.Apellidos + ' (Tutor)' AS Name,
        'Tutor' AS Type
    FROM
        Tutor t
    WHERE
        t.id_Usuario = @id_Usuario

    UNION ALL

    -- Select the children associated with the Tutor
    SELECT
        n.id_Nino AS PersonId,
        n.Nombres + ' ' + n.Apellidos AS Name,
        'Nino' AS Type
    FROM
        Nino n
    INNER JOIN
        TutorNino tn ON n.id_Nino = tn.id_Nino
    INNER JOIN
        Tutor t ON tn.id_Tutor = t.id_Tutor
    WHERE
        t.id_Usuario = @id_Usuario;
END
GO
