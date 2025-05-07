const express = require('express');
const bcrypt = require('bcryptjs');
const { loginUser } = require('../controllers/authController');
const pool = require('../config/db'); // Ensure this import is correct
const router = express.Router();

// Register route

router.post('/register', async (req, res) => {
  const { name, username, role, password } = req.body;

  // Basic checks
  if (!name || !username || !role || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Role-based validation
  const validCombos = {
    admin: { username: 'admin1', password: '12345' },
    manager: { username: 'manager1', password: '54321' },
    user: { username: 'user1', password: '67890' }
  };

  const expected = validCombos[role];

  if (!expected || username !== expected.username || password !== expected.password) {
    return res.status(400).json({ message: 'Invalid role, username or password combination.' });
  }

  // TODO: Add DB logic to store the user if needed
  console.log('User registered:', { name, username, role });

  return res.status(201).json({ message: 'User registered successfully' });
});
// Login route
router.post('/login', loginUser);

module.exports = router;
