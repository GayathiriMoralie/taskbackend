// Import the PostgreSQL client
const client = require('../config/db');

// Create a task
const createTask = async (req, res) => {
  try {
    const { title, description, due_date, priority, status } = req.body;

    // Check if all required fields are present
    if (!title || !description || !due_date || !priority || !status ) {
      return res.status(400).json({ message: 'All fields are required' });
    }



    // SQL query for inserting a new task
    const query = `
      INSERT INTO tasks (title, description, due_date, priority, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [title, description, due_date, priority, status];
    const result = await client.query(query, values);

    // Returning a success response
    return res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({
      message: 'Error creating task',
      error: error.message,
    });
  }
};



// Get tasks assigned to the logged-in user
const getUserTasks = async (req, res) => {
  const userId = req.user.userId;

  try {
    const query = 'SELECT * FROM tasks WHERE assigned_to = $1';
    const values = [userId];

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this user' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};


// Update task status (e.g., to mark a task as completed)
const updateTaskStatus = async (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const result = await client.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task status updated',
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      message: 'Error updating task status',
      error: error.message,
    });
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
    console.error('Error deleting task:', error);
    return res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};


module.exports = { createTask, getUserTasks, updateTaskStatus, deleteTask };
