const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");
const auth = require("../middleware/auth");

// Loan routes

// Create a new loan (only CRP can create a loan)
router.post("/", auth(["crp"]), loanController.createLoan);

// Approve a loan (only admin can approve a loan)
router.post("/:loanId/approve", auth(["admin"]), loanController.approveLoan);

router.get("/count",auth(["admin"]),loanController.getLoanCounts)
// Get loan details (both admin and CRP can view loan details)
router.get("/:id", loanController.getLoan);

// Get all loans (both admin and CRP can view all loans created by them)
router.get("/", auth(["admin", "crp"]), loanController.getAllLoans);

// Generate repayment schedule PDF for a specific loan and member (both admin and CRP can access)
router.get(
  "/:loanId/schedule/:memberId",
  auth(["admin", "crp"]),
  loanController.generateRepaymentSchedulePDF
);

router.delete('/deleteloan/:loanId',loanController.deleteLoan)


module.exports = router;
