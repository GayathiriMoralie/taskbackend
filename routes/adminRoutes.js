require('dotenv').config(); // Load environment variables
const { Client } = require('pg');
const express = require('express');
const router = express.Router();

// Initialize the client with environment variable for the connection string
const client = new Client({
    connectionString: process.env.DATABASE_URL
});

client.connect()
    .then(() => console.log('Connected to Neon DB'))
    .catch((err) => console.error('Error connecting to the database:', err));

// Route to view users in the browser
router.get('/view-users', async (req, res) => {
    try {
        // Fetch users from the database
        const query = 'SELECT * FROM users';
        const result = await client.query(query);
        const users = result.rows;

        // Render the users in a simple HTML table
        let html = '<h1>Users List</h1><table border="1"><tr><th>ID</th><th>Username</th><th>Role</th><th>Registered At</th></tr>';
        users.forEach(user => {
            html += `<tr><td>${user.id}</td><td>${user.username}</td><td>${user.role}</td><td>${user.registered_at}</td></tr>`;
        });
        html += '</table>';

        res.send(html);
    } catch (err) {
        console.error('Error retrieving users:', err.stack);  // Log the full error stack
        res.status(500).send('Error retrieving users');
    }
});

module.exports = router;
