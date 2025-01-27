// models/Collection.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loan",
    required: true,
  },
  installmentNumber: {
    type: Number,
    required: true,
  },
  emiAmount: {
    type: Number,
    required: true,
  },
  savingsAmount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "upi", "bank_transfer", "cheque"],
    required: true,
  },
  transactionId: String,
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  remarks: String,
});

const collectionSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    collectionDate: {
      type: Date,
      required: true,
    },
    collectionMonth: {
      type: String,
      required: true,
    },
    collectionYear: {
      type: Number,
      required: true,
    },
    payments: [paymentSchema],
    totalEmiCollected: {
      type: Number,
      default: 0,
    },
    totalSavingsCollected: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "partial", "completed"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CRP",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedDate: Date,
  },
  { timestamps: true }
);

// Update totals middleware
collectionSchema.pre("save", function (next) {
  this.totalEmiCollected = this.payments.reduce(
    (sum, payment) => sum + payment.emiAmount,
    0
  );
  this.totalSavingsCollected = this.payments.reduce(
    (sum, payment) => sum + payment.savingsAmount,
    0
  );
  next();
});

module.exports = mongoose.model("Collection", collectionSchema);
