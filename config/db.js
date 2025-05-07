const { Client } = require('pg');
require('dotenv').config(); // Ensure .env is loaded

// Log the database URL to verify it's correct
console.log('Database URL:', process.env.DATABASE_URL); 

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false  // Necessary for cloud databases like Neon
  },
  connectionTimeoutMillis: 20000,  // Optional: increase timeout if needed
});

client.connect()
  .then(() => console.log("Connected to Neon DB"))
  .catch((err) => console.error("Connection error:", err));

module.exports = client;
