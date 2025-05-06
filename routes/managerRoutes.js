const express = require("express");
const router = express.Router();

// Sample route to test
router.get("/", (req, res) => {
  res.send("Manager route is working.");
});

module.exports = router;
