const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const sql = require('mssql');
const fs = require('fs');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_OPTIONS_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_OPTIONS_TRUST_SERVER_CERTIFICATE === 'true',
        instanceName: process.env.DB_INSTANCE
    },
    port: 1433
};

async function runSchema() {
    let pool;
    try {
        console.log('Connecting to the database...');
        pool = await sql.connect(dbConfig);
        console.log('Connected.');

        const schemaFilePath = path.resolve(__dirname, '../../database/schema.sql');
        console.log(`Reading schema file: ${schemaFilePath}`);
        const schemaScript = fs.readFileSync(schemaFilePath, 'utf8');

        const batches = schemaScript.split(/^GO\r?\n/im);

        for (const batch of batches) {
            if (batch.trim()) {
                console.log('Executing batch...');
                await pool.request().query(batch);
                console.log('Batch executed successfully.');
            }
        }

        console.log('Schema setup completed successfully!');

    } catch (err) {
        console.error('Error running schema setup:', err.message);
    } finally {
        if (pool) {
            await pool.close();
            console.log('Connection closed.');
        }
    }
}

runSchema();
