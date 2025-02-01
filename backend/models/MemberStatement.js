const mongoose = require("mongoose");

const memberStatementSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["savings_withdrawal", "loan_repayment", "deposit"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
});

module.exports = mongoose.model("MemberStatement", memberStatementSchema);
