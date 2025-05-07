// controllers/userController.js
const pool = require('../config/db');

// Controller function to get user details
const getUserDetails = async (req, res) => {
  try {
    const username = req.query.username;  // Get username from query params

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const query = 'SELECT username, registered_at FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);  // Send the user details in response
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching user details');
  }
};

module.exports = { getUserDetails };  // Ensure the function is exported
