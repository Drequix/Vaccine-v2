const sql = require('mssql');
const fs = require('fs').promises;
const path = require('path');
// Load .env from the 'api' directory
require('dotenv').config({ path: path.resolve(__dirname, '../api/.env') });

// Database configuration from environment variables
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    options: {
        instanceName: process.env.DB_INSTANCE,
        encrypt: process.env.DB_OPTIONS_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_OPTIONS_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true,
    },
    pool: { max: 1, min: 0, idleTimeoutMillis: 30000 },
    connectionTimeout: 60000, // Increased timeout for setup operations
};

async function executeSqlFile(pool, filePath) {
    const script = await fs.readFile(filePath, 'utf-8');
    const statements = script.split(/^\s*GO\s*$/im);
    console.log(`\nExecuting ${statements.length} batches from ${path.basename(filePath)}...`);

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
            try {
                console.log(`-- Executing batch #${i + 1}...`);
                await pool.request().query(statement);
            } catch (err) {
                console.error(`❌ Error executing batch #${i + 1} from ${path.basename(filePath)}.`);
                console.error(`Error Message: ${err.message}`);
                console.error('--- FAILING SQL BATCH ---');
                console.error(statement);
                console.error('-------------------------');
                throw err; // Re-throw to stop the main process
            }
        }
    }
    console.log(`✅ Successfully executed ${path.basename(filePath)}`);
}


async function setupDatabase() {
    let pool;
    try {
        console.log("--- Database Setup Started ---");
        const masterDbConfig = { ...dbConfig, database: 'master' };
        pool = await sql.connect(masterDbConfig);
        console.log("🔗 Connected to master database.");

        const dbName = dbConfig.database;
        const dbExistsResult = await pool.request().query(`SELECT name FROM sys.databases WHERE name = N'${dbName}'`);

        if (dbExistsResult.recordset.length === 0) {
            console.log(`Database '${dbName}' not found. Creating it...`);
            await pool.request().query(`CREATE DATABASE [${dbName}]`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists. Proceeding with setup.`);
        }

        await pool.close();
        pool = await sql.connect(dbConfig);
        console.log(`🔗 Connected to target database '${dbName}'.`);

        const schemaPath = path.join(__dirname, 'schema.sql');
        console.log("\n--- Applying Schema ---");
        await executeSqlFile(pool, schemaPath);

        const proceduresPath = path.join(__dirname, 'programmability');
        const files = await fs.readdir(proceduresPath);
        const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();

        console.log('\n--- Applying Programmability Objects ---');
        for (const file of sqlFiles) {
            const filePath = path.join(proceduresPath, file);
            await executeSqlFile(pool, filePath);
        }

        console.log('\n🎉 Database setup completed successfully! 🎉');

    } catch (err) {
        console.error('\n💥💥💥 DATABASE SETUP FAILED 💥💥💥');
        // The detailed error is already logged in executeSqlFile
        process.exit(1);
    } finally {
        if (pool && pool.connected) {
            await pool.close();
            console.log("\n🔗 Database connection closed.");
        }
    }
}

setupDatabase();
