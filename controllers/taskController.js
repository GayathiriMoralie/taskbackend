// Import the PostgreSQL client
const client = require('../config/db');

// Create a task
const createTask = async (req, res) => {
  try {
    const { title, description, due_date, assigned_to } = req.body;
    if (!title || !description || !due_date || !assigned_to) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
      INSERT INTO tasks (title, description, due_date, assigned_to, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [title, description, due_date, assigned_to, req.user.userId];
    const result = await client.query(query, values);

    return res.status(201).json({ message: 'Task created successfully', task: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating task', error });
  }
};

// Get tasks assigned to the logged-in user
const getUserTasks = async (req, res) => {
  const userId = req.user.userId;

  try {
    const query = 'SELECT * FROM tasks WHERE assigned_to = $1';
    const values = [userId];

    const result = await client.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// Update task status (e.g., to mark a task as completed)
const updateTaskStatus = async (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;  // Assuming status is sent in the request body

  try {
    const result = await client.query('UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', [status, taskId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task status updated', task: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};

// Function to delete a task
const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    // Check if task exists
    const result = await client.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = result.rows[0];

    // Check if the user has permission to delete the task
    if (task.created_by !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this task' });
    }

    // Delete the task
    await client.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting task', error });
  }
};

module.exports = { createTask, getUserTasks, updateTaskStatus, deleteTask };
