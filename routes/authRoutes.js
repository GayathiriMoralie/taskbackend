const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Router();

// Allow GET request to /api/auth/register for testing purposes
router.get('/register', (req, res) => {
  res.send('This is the register endpoint, please use POST to register.');
});

// POST route to register a user
router.post('/register', registerUser);

// POST route to login a user
router.post('/login', loginUser);

module.exports = router;



