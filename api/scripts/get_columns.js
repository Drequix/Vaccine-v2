const { connectDB, getPool, closeDB } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function getColumnsForTable(tableName) {
  if (!tableName) {
    console.error('🔴 Please provide a table name as an argument.');
    return;
  }

  console.log(`[DB INFO] 🔄 Attempting to get columns for table: ${tableName}...`);
  const outputFile = path.join(__dirname, `${tableName}_columns.txt`);
  let columnInfo = '';

  try {
    await connectDB();
    const pool = getPool();
    const query = `
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = @tableName
      ORDER BY ORDINAL_POSITION;
    `;
    const result = await pool.request()
      .input('tableName', tableName)
      .query(query);
    
    if (result.recordset.length === 0) {
      columnInfo = `No columns found for table '${tableName}'. Please check the table name.`;
    } else {
      result.recordset.forEach(row => {
        columnInfo += `${row.COLUMN_NAME} (${row.DATA_TYPE}${row.CHARACTER_MAXIMUM_LENGTH ? `(${row.CHARACTER_MAXIMUM_LENGTH})` : ''})\n`;
      });
    }

    fs.writeFileSync(outputFile, columnInfo);
    console.log(`--- Column info for ${tableName} written to ${outputFile} ---`);

  } catch (err) {
    console.error(`🔴 ERROR_GETTING_COLUMNS for ${tableName}:`, err.message);
    fs.writeFileSync(outputFile, `Error getting columns: ${err.message}`);
  } finally {
    await closeDB();
    console.log('[DB INFO] ✅ Connection closed.');
  }
}

// Get table name from command line arguments
const tableName = process.argv[2];
getColumnsForTable(tableName);
