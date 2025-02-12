const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  branch: { type: String, required: true },
  ifsc: { type: String, required: true },
  interestRate: { type: Number, required: true },
  additionalDetails: { type: String },
});

const repaymentScheduleSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  installments: [
    {
      installmentNumber: Number,
      dueDate: Date,
      amount: Number,
      principal: Number,
      interest: Number,
      status: {
        type: String,
        enum: ["pending", "paid", "overdue"],
        default: "pending",
      },
      paidAmount: { type: Number, default: 0 },
      paidDate: Date,
    },
  ],
  totalAmount: Number,
  paidAmount: { type: Number, default: 0 },
});

const loanSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    totalAmount: { type: Number, required: true },
    perMemberAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    termMonths: { type: Number, required: true },
    startDate: { type: Date, required: true },
    bankDetails: bankSchema, // Include bank details
    repaymentSchedules: [repaymentScheduleSchema],
    status: {
      type: String,
      enum: ["pending", "approved", "active","paid", "closed", "overdue", "defaulted"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    approvedDate: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CRP",
      required: true,
    },
    loanAccountNo: { type: String, required: true },
    savingAccountNo: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
