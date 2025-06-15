const fs = require('fs');
const path = require('path');
const { poolConnect, sql } = require('../config/db');

const runMigration = async () => {
    try {
        const pool = await poolConnect;
        console.log('Connected to database.');

        const migrationFile = path.join(__dirname, 'V11__restructure_child_registration.sql');
        const migrationScript = fs.readFileSync(migrationFile, 'utf8');

        // Split script into batches by GO statement
        const batches = migrationScript.split(/^GO\r?\n/im);

        for (const batch of batches) {
            if (batch.trim() !== '') {
                console.log('Executing batch...');
                await pool.request().batch(batch);
                console.log('Batch executed successfully.');
            }
        }

        console.log('Migration V11 completed successfully.');
    } catch (err) {
        console.error('Error during migration V11:', err);
    } finally {
        sql.close();
    }
};

runMigration();
