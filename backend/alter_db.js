const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {minVersion: 'TLSv1.2', rejectUnauthorized: true}
  });
  
  try {
    await pool.query("ALTER TABLE products ADD COLUMN offer_price DECIMAL(10, 2) NULL, ADD COLUMN offer_moq INT DEFAULT 1;");
    console.log('ALTER done');
  } catch (e) {
    if (e.message.includes('Duplicate column name')) {
      console.log('Column already exists');
    } else {
      console.error(e);
    }
  }
  pool.end();
}

run();
