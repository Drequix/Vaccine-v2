const path = require('path');
// Explicitly load .env from the api directory, which is one level up
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const fs = require('fs');
const { connectDB, getPool, sql } = require('../config/db');

const runMigration = async () => {
    try {
        await connectDB(); // Establish connection first
        const pool = getPool(); // Then get the pool
        console.log('Database connection established.');

        const migrationFile = path.join(__dirname, 'V13__create_history_procedures.sql');
        const migrationScript = fs.readFileSync(migrationFile, 'utf8');

        const batches = migrationScript.split(/^GO\r?\n/im);

        for (const batch of batches) {
            if (batch.trim() !== '') {
                console.log('Executing batch...');
                await pool.request().batch(batch);
                console.log('Batch executed successfully.');
            }
        }

        console.log('Migration V13 completed successfully.');
    } catch (err) {
        console.error('Error during migration V13:', err);
    } finally {
        if (sql && sql.close) {
            await sql.close();
            console.log('Database connection closed.');
        }
    }
};

runMigration();
