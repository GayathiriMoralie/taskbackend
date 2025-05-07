const express = require('express');
const db = require('../config/db'); // ✅ Required if you use db.query
const { createTask, getUserTasks, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/register', async (req, res) => {
  const { name, username, role, password } = req.body;

  const validCombos = {
    manager1: { role: 'manager', password: '54321' },
    user1: { role: 'user', password: '67890' },
    admin1: { role: 'admin', password: '12345' }
  };

  const valid = validCombos[username];

  if (!valid || valid.role !== role || valid.password !== password) {
    return res.status(400).json({ message: 'Invalid username, role, or password combination' });
  }

  try {
    const existing = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Username already registered' });
    }

    const newUser = await pool.query(
      'INSERT INTO users (name, username, role, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, username, role, password]
    );

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// Route to create a task (Only accessible by admin)
router.post('/tasks', authMiddleware(), createTask);

// Route to get tasks assigned to the logged-in user
router.get('/tasks', authMiddleware(), getUserTasks);

// Route to update task status
router.patch('/tasks/:id/status', authMiddleware(), updateTaskStatus);

// Route to delete a task (Only accessible by admin)
router.delete('/tasks/:taskId', authMiddleware('admin'), deleteTask);

// (Optional) Test route: fetch all tasks (for dev or admin)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

module.exports = router;
