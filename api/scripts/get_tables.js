const { connectDB, getPool, closeDB } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function listTables() {
  console.log('[DB INFO] 🔄 Attempting to list tables and write to file...');
  const outputFile = path.join(__dirname, 'table_list.txt');
  let tableNames = '';

  try {
    await connectDB();
    const pool = getPool();
    const result = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME;");
    
    result.recordset.forEach(row => {
      tableNames += row.TABLE_NAME + '\n'; // Newline for each table
    });

    fs.writeFileSync(outputFile, tableNames);
    console.log(`--- Tables in Database written to ${outputFile} ---`);

  } catch (err) {
    console.error('🔴 ERROR_LISTING_TABLES:', err.message);
    fs.writeFileSync(outputFile, `Error listing tables: ${err.message}`);
  } finally {
    await closeDB();
    console.log('[DB INFO] ✅ Connection closed.');
  }
}

listTables();
