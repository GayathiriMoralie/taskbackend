const express = require('express');
const { createTask, getUserTasks, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a task (Only accessible by admin)
router.post('/tasks', authMiddleware(), createTask);

// Route to get tasks assigned to the logged-in user
router.get('/tasks', authMiddleware(), getUserTasks);

// Route to update task status
router.patch('/tasks/:id/status', authMiddleware(), updateTaskStatus);

// Route to delete a task (Only accessible by admin)
router.delete('/tasks/:taskId', authMiddleware('admin'), deleteTask);

module.exports = router;
