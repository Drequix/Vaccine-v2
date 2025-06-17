const fs = require('fs');
const path = require('path');
const { connectDB, closeDB, getPool } = require('../config/db');

const outputFile = path.join(__dirname, 'full_history_schema_output.txt');
// Clear the file at the start
fs.writeFileSync(outputFile, '');
const outputStream = fs.createWriteStream(outputFile, { flags: 'a' });

// Redirect console.log to the file
const log = (message) => {
    outputStream.write(message + '\n');
    process.stdout.write(message + '\n'); // Also log to console
};


async function runInspector() {
    log('[DB INFO] Attempting to connect to SQL Server...');
    try {
        await connectDB();
        log('[DB SUCCESS] Successfully connected!');
        const pool = getPool();

        const scriptPath = path.join(__dirname, 'inspect_full_history_schema.sql');
        const script = fs.readFileSync(scriptPath, 'utf8');

        const commands = script.split(';').filter(cmd => cmd.trim().length > 0);

        for (const command of commands) {
            const tableNameMatch = command.match(/'dbo\.(.*?)'/);
            const tableName = tableNameMatch ? tableNameMatch[1] : 'Unknown';
            try {
                log(`\n--- Inspecting Schema for: ${tableName} ---`);
                const request = pool.request();
                const result = await request.query(command);
                log('Result:');
                log(JSON.stringify(result.recordsets, null, 2));
            } catch (cmdError) {
                log(`Error executing command for ${tableName}: ${cmdError.message}`);
            }
        }

    } catch (err) {
        log(`[DB ERROR] Failed to run schema inspector: ${err.message}`);
    } finally {
        await closeDB();
        log('[DB INFO] Connection closed.');
        outputStream.end();
    }
}

runInspector();
