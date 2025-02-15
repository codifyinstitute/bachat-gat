const mongoose = require("mongoose");

const deletedLoanSchema = new mongoose.Schema(
  {
    originalLoanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
    },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    totalAmount: Number,
    perMemberAmount: Number,
    interestRate: Number,
    termMonths: Number,
    startDate: Date,
    bankDetails: Object,
    repaymentSchedules: Array,
    status: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    approvedDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "CRP" },
    loanAccountNo: String,
    savingAccountNo: String,
    deletedAt: { type: Date, default: Date.now }, // Timestamp of deletion
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // User who deleted the loan
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeletedLoan", deletedLoanSchema);
