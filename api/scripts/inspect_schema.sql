PRINT '--- Inspecting dbo.Usuario ---';
BEGIN TRY
    EXEC sp_help 'dbo.Usuario';
END TRY
BEGIN CATCH
    PRINT 'Could not find dbo.Usuario.';
    PRINT ERROR_MESSAGE();
END CATCH
GO

PRINT '--- Inspecting dbo.Usuarios ---';
BEGIN TRY
    EXEC sp_help 'dbo.Usuarios';
END TRY
BEGIN CATCH
    PRINT 'Could not find dbo.Usuarios.';
    PRINT ERROR_MESSAGE();
END CATCH
GO

PRINT '--- Inspecting dbo.Nino ---';
BEGIN TRY
    EXEC sp_help 'dbo.Nino';
END TRY
BEGIN CATCH
    PRINT 'Could not find dbo.Nino.';
    PRINT ERROR_MESSAGE();
END CATCH
GO
