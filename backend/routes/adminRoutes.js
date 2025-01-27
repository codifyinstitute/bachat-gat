const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");

// Admin routes
router.post("/login", adminController.login);
router.post("/create-crp", auth(["admin"]), adminController.createCRP);

module.exports = router;
