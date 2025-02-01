const mongoose = require("mongoose");

const groupStatementSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["savings_withdrawal", "loan_disbursement", "deposit"],
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

module.exports = mongoose.model("GroupStatement", groupStatementSchema);
