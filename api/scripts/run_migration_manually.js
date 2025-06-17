const fs = require('fs').promises;
const path = require('path');
const { connectDB, getPool, closeDB } = require('../config/db');

async function runMigration() {
    console.log('--- Starting Manual Migration ---');
    try {
        await connectDB();
        const pool = getPool();
        console.log('Database connection successful.');

        const migrationFile = 'V14__create_admin_dashboard_procedure.sql';
        const migrationFilePath = path.join(__dirname, migrationFile);
        console.log(`Reading migration file from: ${migrationFilePath}`);
        
        const sqlScript = await fs.readFile(migrationFilePath, 'utf-8');
        
        // SQL Server scripts often use GO as a batch separator, which mssql library doesn't understand.
        // We need to split the script into batches and execute them one by one.
        const batches = sqlScript.split(/^GO\r?\n/im);

        for (const batch of batches) {
            if (batch.trim()) {
                console.log('Executing batch...');
                await pool.request().query(batch);
                console.log('Batch executed successfully.');
            }
        }

        console.log('--- Manual Migration Completed Successfully ---');

    } catch (error) {
        console.error('!!! MANUAL MIGRATION FAILED !!!');
        console.error('Error:', error.message);
        if (error.originalError) {
            console.error('Original DB Error:', error.originalError);
        }
    } finally {
        await closeDB();
        console.log('Database connection closed.');
    }
}

runMigration();
