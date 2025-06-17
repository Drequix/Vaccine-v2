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

async function runProcedures() {
    let pool;
    try {
        console.log('Connecting to the database to run procedures...');
        pool = await sql.connect(dbConfig);
        console.log('Connected.');

        const proceduresPath = path.resolve(__dirname, '../../database/programmability');
        const files = fs.readdirSync(proceduresPath).filter(file => file.endsWith('.sql'));

        for (const file of files) {
            const filePath = path.join(proceduresPath, file);
            console.log(`Executing procedure file: ${file}`);
            const script = fs.readFileSync(filePath, 'utf8');
            const batches = script.split(/^GO\r?\n/im);

            for (const batch of batches) {
                if (batch.trim()) {
                    await pool.request().query(batch);
                }
            }
            console.log(`Successfully executed ${file}`);
        }

        console.log('All stored procedures have been created successfully!');

    } catch (err) {
        console.error('Error running stored procedures script:', err.message);
    } finally {
        if (pool) {
            await pool.close();
            console.log('Connection closed.');
        }
    }
}

runProcedures();
