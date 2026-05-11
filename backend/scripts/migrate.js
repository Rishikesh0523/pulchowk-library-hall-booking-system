require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

const run = async () => {
  try {
    const sqlPath = path.resolve(__dirname, '../../database/init.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('init.sql not found at', sqlPath);
      process.exit(1);
    }
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log('Applying migration:', sqlPath);
    await pool.query(sql);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
