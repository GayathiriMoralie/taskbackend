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

// Register a new user
const allowedRoles = {
    user: 'user123',
    manager: 'manager123',
    admin: 'admin123'
  };
  
  const registerUser = async (req, res) => {
    try {
      const { username, password, role, name } = req.body;
  
      // Check if any field is missing
      if (!username || !password || !role || !name) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      // Check if role is valid and password matches
      if (!allowedRoles[role] || allowedRoles[role] !== password) {
        return res.status(401).json({ message: 'Invalid role or password.' });
      }
  
      // Save the user (this part will depend on your DB setup)
      const newUser = {
        username,
        password,  // Consider hashing in real apps
        role,
        name
      };
  
      // Example: await User.create(newUser);
      res.status(201).json({ message: 'Registration successful', user: newUser });
  
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
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
