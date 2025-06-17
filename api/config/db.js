const sql = require("mssql");
require('dotenv').config(); // Ensure .env is loaded

let pool;

// Single, reliable configuration using environment variables
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
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
};

const connectDB = async () => {
    try {
        if (pool && pool.connected) {
            return pool;
        }
        
        console.log("[DB INFO] 🔄 Attempting to connect to SQL Server...");
        console.log(`[DB INFO] 🔍 Using config: Server=${dbConfig.server}\\\\${dbConfig.options.instanceName}, DB=${dbConfig.database}, User=${dbConfig.user}`);

        pool = await sql.connect(dbConfig);

        console.log(`[DB SUCCESS] ✅ Successfully connected to ${dbConfig.database}!`);
        const testResult = await pool.request().query("SELECT @@SERVERNAME as serverName");
        console.log(`[DB INFO] 📊 Connected to server: ${testResult.recordset[0].serverName}`);
        
        return pool;
    } catch (err) {
        console.error("[DB FAILED] ❌ Database connection failed.");
        console.error(`[DB ERROR] Code: ${err.code} | Message: ${err.message}`);
        // Log the config for debugging, but hide the password
        const debugConfig = { ...dbConfig, password: '********' };
        console.error("[DB DEBUG] 🔍 Connection config used:", JSON.stringify(debugConfig, null, 2));
        process.exit(1); // Exit if DB connection fails
    }
};

const getPool = () => {
    if (!pool || !pool.connected) {
        throw new Error("❌ Database not connected. Call connectDB() first.");
    }
    return pool;
};

const closeDB = async () => {
    if (pool) {
        try {
            await pool.close();
            pool = null;
            console.log("[DB INFO] 🔒 Database connection closed successfully.");
        } catch (err) {
            console.error("[DB ERROR] Error closing the database connection:", err.message);
        }
    }
};

module.exports = {
    sql,
    connectDB,
    getPool,
    closeDB,
};
