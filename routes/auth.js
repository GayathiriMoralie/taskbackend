// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const pool = require('../config/db');

// // Middleware to verify token
// const authenticate = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) return res.status(401).json({ error: 'No token provided' });

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(403).json({ error: 'Invalid token' });
//     req.user = decoded;
//     next();
//   });
// };

// // Register
// router.post('/register', async (req, res) => {
//   const { username, password, role = 'user' } = req.body;
//   if (!username || !password) {
//     return res.status(400).json({ error: 'Username and password are required' });
//   }

//   try {
//     const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
//     if (existingUser.rows.length > 0) {
//       return res.status(400).json({ error: 'Username is already taken' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const result = await pool.query(
//       'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
//       [username, hashedPassword, role]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ error: 'Error registering user' });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(400).json({ error: 'Username and password are required' });
//   }

//   try {
//     const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
//     if (result.rows.length === 0) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const user = result.rows[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.json({
//       token,
//       role: user.role,
//       userId: user.id,
//       username: user.username
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Error logging in' });
//   }
// });

// // Protected Routes
// router.get('/user-data', authenticate, async (req, res) => {
//   try {
//     const result = await pool.query(
//       'SELECT id, username AS name, role FROM users WHERE id = $1',
//       [req.user.userId]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('User data error:', error);
//     res.status(500).json({ error: 'Failed to fetch user data' });
//   }
// });

// router.get('/admin-data', authenticate, async (req, res) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Access denied. Admins only.' });
//   }
//   try {
//     const result = await pool.query(
//       'SELECT id, username AS name, role FROM users WHERE id = $1',
//       [req.user.userId]
//     );
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Admin data error:', error);
//     res.status(500).json({ error: 'Failed to fetch admin data' });
//   }
// });

// router.get('/manager-data', authenticate, async (req, res) => {
//   if (req.user.role !== 'manager') {
//     return res.status(403).json({ error: 'Access denied. Managers only.' });
//   }
//   try {
//     const result = await pool.query(
//       'SELECT id, username AS name, role FROM users WHERE id = $1',
//       [req.user.userId]
//     );
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Manager data fetch error:', error);
//     res.status(500).json({ error: 'Failed to fetch manager data' });
//   }
// });

// module.exports = router;
