const express = require("express");
const router = express.Router();
const { getUserDetails } = require('../controllers/userController');  // Ensure the import is correct

// Sample test route
router.get("/", (req, res) => {
  res.send("User route is working.");
});

// Route to get user details based on username
router.get("/user/details", getUserDetails);  // Use the imported function directly here

module.exports = router;
