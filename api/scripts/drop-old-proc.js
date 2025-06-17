const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const sql = require('mssql');

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

async function dropProcedure() {
    let pool;
    try {
        console.log('Connecting to the database...');
        pool = await sql.connect(dbConfig);
        console.log('Connected.');

        console.log("Attempting to drop old procedure 'usp_GetUserForAuth'...");
        const checkProcSql = `IF OBJECT_ID('usp_GetUserForAuth', 'P') IS NOT NULL DROP PROCEDURE usp_GetUserForAuth;`;
        await pool.request().query(checkProcSql);
        console.log("Successfully dropped 'usp_GetUserForAuth' if it existed.");

    } catch (err) {
        console.error('Error dropping procedure:', err.message);
    } finally {
        if (pool) {
            await pool.close();
            console.log('Connection closed.');
        }
    }
}

dropProcedure();
