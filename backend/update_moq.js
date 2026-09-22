const mysql = require('mysql2/promise');
require('dotenv').config();

const updateDB = async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });

    const connection = await pool.getConnection();
    
    console.log('Adding moq column...');
    try {
      await connection.query('ALTER TABLE products ADD COLUMN moq INT DEFAULT 1 AFTER offer_end_date;');
      console.log('moq column added successfully.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('moq column already exists.');
      } else {
        throw err;
      }
    }

    connection.release();
    pool.end();
    console.log('Done.');
  } catch (error) {
    console.error('Error updating DB:', error);
  }
};

updateDB();
