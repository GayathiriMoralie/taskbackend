const client = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');  // Assuming you have an authentication middleware

// Get list of all users (only for admin)
const getUsers = async (req, res) => {
  const userRole = req.user.role; // User role from JWT

  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Permission denied' });
  }

  try {
    const query = 'SELECT id, username, role, registered_at FROM users';
    const result = await client.query(query);

    // Check if any users exist
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Delete a user (only for admin)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role; // User role from JWT

  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Permission denied' });
  }

  try {
    const query = 'DELETE FROM users WHERE id = $1';
    const values = [id];
    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = { getUsers, deleteUser };
