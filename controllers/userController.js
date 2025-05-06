// controllers/userController.js
const client = require('../config/db');
const {authMiddleware} = require('../middleware/authMiddleware'); // Assuming authMiddleware is used elsewhere

// Controller function to get user details
// userController.js
const getUserDetails = async (req, res) => {
    try {
      const result = await db.query('SELECT username, logintime FROM users');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching user details');
    }
  };
  
module.exports = { getUserDetails };
