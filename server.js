const Task = require('./routes/taskRoutes'); // Adjust the path if it's elsewhere
const pool =require('./config/db');
const express = require('express');

const cors = require('cors');
const client = require('./config/db'); // ✅ Import client from db.js
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const { updateTaskStatus } = require('./controllers/taskController');
const verifyToken = require('./utils/tokenUtils');
const authMiddleware = require('./middleware/authMiddleware');
const { getUsers, deleteUser } = require('./controllers/adminController');
const { getUserDetails } = require('./controllers/userController');  // Ensure correct import
const adminController = require('./controllers/adminController');
const userController = require('./controllers/userController');
const http = require('http');
const socketIo = require('socket.io');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Load environment variables
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());  // Use express.json() to parse JSON bodies

// Use routes
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);   

// Correct route to get user details using the controller
app.get('/api/users/details', async (req, res) => {
  try {
    const result = await client.query('SELECT username, registered_at, last_login FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details', error: error.message });
  }
  const updateLoginTimeQuery = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE username = $1';
await pool.query(updateLoginTimeQuery, [username]);
});

// Inside your backend, e.g., server.js

// In the backend, for example, with Express.js:
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
const db = require('./config/db'); // Adjust path if needed

app.patch('/api/tasks/:taskId/status', async (req, res) => {
  const taskId = req.params.taskId;
  const { status } = req.body;

  try {
    const result = await db.query(
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
app.get('/tasks', (req, res) => {
  console.log('Received request for tasks');
  // Fetch tasks from database and respond
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
