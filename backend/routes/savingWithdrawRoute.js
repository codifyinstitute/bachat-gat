const express = require("express");
const router = express.Router();
const withdrawController = require("../controllers/savingWithdrawController");
const auth = require("../middleware/auth");

// Loan routes

// Create a new loan (only CRP can create a loan)
router.post("/",auth(['crp']), withdrawController.createSaving);

router.get("/all",auth(['admin']),withdrawController.getAllSavings);

router.get("/:")



module.exports = router;