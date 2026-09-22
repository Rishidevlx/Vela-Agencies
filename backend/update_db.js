const pool = require('./config/db');

async function updateDb() {
  try {
    const connection = await pool.getConnection();
    console.log('Adding new columns to products table...');
    
    // Add is_offer_active
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN is_offer_active BOOLEAN DEFAULT FALSE;`);
      console.log('Added is_offer_active');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('is_offer_active already exists');
      else throw e;
    }

    // Add offer_start_date
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN offer_start_date DATETIME NULL;`);
      console.log('Added offer_start_date');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('offer_start_date already exists');
      else throw e;
    }

    // Add offer_end_date
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN offer_end_date DATETIME NULL;`);
      console.log('Added offer_end_date');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('offer_end_date already exists');
      else throw e;
    }

    connection.release();
    console.log('Database updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to update db:', err);
    process.exit(1);
  }
}

// Give pool a little time to initialize
setTimeout(updateDb, 2000);
