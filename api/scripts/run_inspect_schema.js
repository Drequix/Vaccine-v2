const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const fs = require('fs');
const { connectDB, getPool, sql } = require('../config/db');

const inspectSchema = async () => {
    try {
        await connectDB();
        const pool = getPool();
        console.log('Database connection established.');

        const scriptFile = path.join(__dirname, 'inspect_schema.sql');
        const scriptContent = fs.readFileSync(scriptFile, 'utf8');

        const batches = scriptContent.split(/^GO\r?\n/im);

        for (const batch of batches) {
            if (batch.trim() !== '') {
                console.log('--- Executing Batch ---');
                const result = await pool.request().query(batch);
                // sp_help can return multiple result sets, let's log them all
                console.log('Result:', JSON.stringify(result.recordsets, null, 2));
                console.log('--- Batch Executed ---');
            }
        }

        console.log('Schema inspection completed.');
    } catch (err) {
        console.error('Error during schema inspection:', err.message);
    } finally {
        if (sql && sql.close) {
            await sql.close();
            console.log('Database connection closed.');
        }
    }
};

inspectSchema();
