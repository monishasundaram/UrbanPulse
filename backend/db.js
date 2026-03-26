const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database!');
  }
});

module.exports = pool;