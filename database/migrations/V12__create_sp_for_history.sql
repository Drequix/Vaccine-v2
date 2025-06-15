IF OBJECT_ID('usp_GetPeopleForHistory', 'P') IS NOT NULL
    DROP PROCEDURE usp_GetPeopleForHistory;
GO

CREATE PROCEDURE usp_GetPeopleForHistory
    @id_Usuario INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Primero, obtener el id_Tutor asociado con el id_Usuario
    DECLARE @id_Tutor INT;
    SELECT @id_Tutor = id_Tutor FROM Tutor WHERE id_Usuario = @id_Usuario;

    -- Comprobar si se encontró un tutor
    IF @id_Tutor IS NOT NULL
    BEGIN
        -- Seleccionar la información del propio Tutor
        SELECT
            T.id_Tutor AS PersonId,
            T.Nombres + ' ' + T.Apellidos AS FullName,
            'Tutor' AS PersonType
        FROM
            Tutor AS T
        WHERE
            T.id_Tutor = @id_Tutor

        UNION ALL

        -- Seleccionar los niños (Ninos) vinculados al Tutor
        SELECT
            N.id_Nino AS PersonId,
            N.Nombres + ' ' + N.Apellidos AS FullName,
            'Nino' AS PersonType
        FROM
            Nino AS N
        INNER JOIN
            TutorNino AS TN ON N.id_Nino = TN.id_Nino
        WHERE
            TN.id_Tutor = @id_Tutor;
    END
END
GO
