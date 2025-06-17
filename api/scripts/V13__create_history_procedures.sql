-- V13: Creates stored procedures for the vaccination history feature.
-- This is the definitive, corrected version based on verified schema from V8 and V9 scripts.

-- Drop existing procedures if they exist to ensure a clean slate
IF OBJECT_ID('dbo.usp_GetTutorAndChildrenForHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetTutorAndChildrenForHistory;
GO

IF OBJECT_ID('dbo.usp_GetVaccinationHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetVaccinationHistory;
GO

-- Procedure to get the list of people for the history dropdown
IF OBJECT_ID('dbo.usp_GetTutorAndChildrenForHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetTutorAndChildrenForHistory;
GO

CREATE PROCEDURE dbo.usp_GetTutorAndChildrenForHistory
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Get the Tutor's own info (using the corrected schema)
    SELECT
        U.id_Usuario AS PersonId,
        U.Nombre + ' ' + U.Apellido AS Name, -- Corrected to singular based on schema
        'Tutor' AS Type
    FROM 
        dbo.Usuario U
    WHERE
        U.id_Usuario = @UserId

    UNION ALL

    -- Get the children associated with the tutor (using the corrected schema)
    SELECT
        N.id_Nino AS PersonId,
        N.Nombres + ' ' + N.Apellidos AS Name,
        'Nino' AS Type
    FROM
        dbo.Nino N
    INNER JOIN
        dbo.TutorNino TN ON N.id_Nino = TN.id_Nino
    WHERE
        TN.id_Tutor = @UserId;
END
GO

-- Procedure to get the vaccination history for a selected person
IF OBJECT_ID('dbo.usp_GetVaccinationHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetVaccinationHistory;
GO

CREATE PROCEDURE dbo.usp_GetVaccinationHistory
    @PersonType VARCHAR(10),
    @PersonId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @PersonType = 'Nino'
    BEGIN
        -- Fetch history directly for the child
        SELECT
            id_Historico,
            id_Nino,
            FechaAplicacion,
            DosisAplicada,
            EdadAlMomento,
            VacunaNombre,
            FabricanteNombre,
            LoteNumero,
            PersonalSaludNombre,
            NotasAdicionales
        FROM
            dbo.HistoricoVacunas
        WHERE
            id_Nino = @PersonId
        ORDER BY
            FechaAplicacion DESC;
    END
    ELSE IF @PersonType = 'Tutor'
    BEGIN
        -- Fetch history for all children associated with the tutor
        SELECT
            H.id_Historico,
            H.id_Nino,
            H.FechaAplicacion,
            H.DosisAplicada,
            H.EdadAlMomento,
            H.VacunaNombre,
            H.FabricanteNombre,
            H.LoteNumero,
            H.PersonalSaludNombre,
            H.NotasAdicionales
        FROM
            dbo.HistoricoVacunas H
        INNER JOIN
            dbo.TutorNino TN ON H.id_Nino = TN.id_Nino
        WHERE
            TN.id_Tutor = @PersonId
        ORDER BY
            H.FechaAplicacion DESC;
    END
    -- If PersonType is neither 'Nino' nor 'Tutor', it will return an empty result set.

END
GO
