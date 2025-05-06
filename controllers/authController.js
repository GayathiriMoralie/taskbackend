const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const client = require('../config/db'); // PostgreSQL connection

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Register a new user (Admin, Manager, User)
const registerUser = async (req, res) => {
    const { username, password, role } = req.body;
  
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = `INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *`;
      const values = [username, hashedPassword, role];
  
      console.log('Running query:', query);
      console.log('With values:', values);
  
      const result = await client.query(query, values);
  
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          role: result.rows[0].role
        }
      });
    } catch (err) {
      console.error('Detailed registration error:', err); // <-- Shows the real problem
      res.status(500).json({ message: 'Error registering user' });
    }
  };
  

// Log in a user and return JWT token
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const query = `SELECT * FROM users WHERE username = $1`;
    const values = [username];

    const result = await client.query(query, values);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error in loginUser:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
  

};

module.exports = {
  registerUser,
  loginUser,
  verifyToken
};
