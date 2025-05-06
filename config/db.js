// db.js
const { Client } = require('pg');
require('dotenv').config(); // make sure this is here if using .env

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect()
  .then(() => console.log("Connected to Neon DB"))
  .catch((err) => console.error("Connection error:", err));

module.exports = client;
