const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bankController"); // Adjust the path as needed

// Get all banks
router.get("/", bankController.getBanks);

// Get a bank by ID
router.get("/:id", bankController.getBankById);

// Create a new bank
router.post("/", bankController.createBank);

// Update an existing bank
router.put("/:id", bankController.updateBank);

// Delete a bank
router.delete("/:id", bankController.deleteBank);

// Add default banks to the database
router.post("/default", bankController.addDefaultBanks);

module.exports = router;
