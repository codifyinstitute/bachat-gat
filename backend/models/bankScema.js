const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  ifsc: {
    type: String,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  additionalDetails: {
    type: String,
  },
});

const Bank = mongoose.model("Bank", bankSchema);

const defaultBanks = [
  {
    name: "State Bank of India",
    branch: "Market Yard",
    ifsc: "SBIN0001887",
    interestRate: 13.0,
  },
  {
    name: "Bank Of Maharashtra",
    branch: "Rajarampuri",
    ifsc: "MAHB0000410",
    interestRate: 12.99,
  },
  {
    name: "Canera Bank",
    branch: "Dasara Chowk",
    ifsc: "CNRB0015230",
    interestRate: 13.0,
  },
];

module.exports = { Bank, defaultBanks };
