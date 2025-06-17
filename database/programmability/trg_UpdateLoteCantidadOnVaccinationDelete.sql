IF OBJECT_ID('dbo.trg_UpdateLoteCantidadOnVaccinationDelete', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_UpdateLoteCantidadOnVaccinationDelete;
GO

CREATE TRIGGER dbo.trg_UpdateLoteCantidadOnVaccinationDelete
ON dbo.HistoricoVacunas
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Temp table to store the lots and the quantity to add back
    DECLARE @LotUpdates TABLE (
        id_LoteVacuna INT,
        QuantityToReturn INT
    );

    -- Populate the temp table by finding the lot associated with the deleted vaccination record
    -- The link is through the CitaVacunacion table using the id_Cita
    INSERT INTO @LotUpdates (id_LoteVacuna, QuantityToReturn)
    SELECT
        cv.id_LoteAplicado,
        COUNT(*)
    FROM
        deleted d
    JOIN
        dbo.CitaVacunacion cv ON d.id_Cita = cv.id_Cita
    WHERE
        cv.id_LoteAplicado IS NOT NULL
    GROUP BY
        cv.id_LoteAplicado;

    -- Update the Lote table by adding back the quantity
    UPDATE l
    SET
        l.CantidadDisponible = l.CantidadDisponible + lu.QuantityToReturn
    FROM
        dbo.Lote l
    JOIN
        @LotUpdates lu ON l.id_LoteVacuna = lu.id_LoteVacuna;

END;
GO
