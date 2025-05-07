const pool = require('./config/db');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { updateTaskStatus } = require('./controllers/taskController');
const authMiddleware = require('./middleware/authMiddleware');
const { getUsers, deleteUser } = require('./controllers/adminController');
const { getUserDetails } = require('./controllers/userController');
const http = require('http');
const socketIo = require('socket.io');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Load environment variables
dotenv.config();

// Middleware
app.use(cors({
  origin: 'http://localhost:3500',  // Replace with your frontend's origin if different
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());  // Parse JSON bodies

// Use routes
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// User details route
app.get('/api/users/details', authMiddleware, async (req, res) => {
  try {
    // Get user details from the database
    const userDetails = await pool.query('SELECT id, username, name, role, registered_at FROM users WHERE id = $1', [req.user.id]);

    if (userDetails.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user details without the last_login field
    res.json(userDetails.rows[0]);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details', error: error.message });
  }
});

// Task creation route
app.post('/api/tasks/create', async (req, res) => {
  const { title, description, due_date, priority, status, assignedTo } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, due_date, priority, status, assigned_to) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, due_date, priority, status, assignedTo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Task status update route with Socket.IO integration
app.patch('/api/tasks/:taskId/status', async (req, res) => {
  const taskId = req.params.taskId;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = result.rows[0];

    // Emit real-time update via Socket.IO
    io.emit('taskStatusUpdated', { taskId, status });

    return res.status(200).json({
      message: 'Task status updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Root route handler
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Use authMiddleware for admin routes
app.get('/api/users', authMiddleware, getUsers);  // Get users only for admin
app.delete('/api/users/:id', authMiddleware, deleteUser);  // Delete user only for admin

// Start the server with Socket.IO
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
