const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");
const auth = require("../middleware/auth");

// Loan routes
router.post("/", auth(["crp"]), loanController.createLoan);

router.post("/:loanId/approve", auth(["admin"]), loanController.approveLoan);

router.get("/:id", auth(["admin", "crp"]), loanController.getLoan);

router.get("/", auth(["admin", "crp"]), loanController.getAllLoans);

router.get(
  "/:loanId/schedule/:memberId",
  auth(["admin", "crp"]),
  loanController.generateRepaymentSchedulePDF
);

module.exports = router;
