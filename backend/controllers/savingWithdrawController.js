const Saving = require("../models/SavingWithdraw");

// @desc Create a new saving entry
// @route POST /api/savings
// @access Public
const createSaving = async (req, res) => {
  try {
    const {
      loanId,
      groupId,
      bankName,
      groupName,
      loanStatus,
      withdrawStatus,
      totalSavingAmount,
      memberList,
    } = req.body;

    // Validate required fields
    if (!loanId || !groupId || !bankName || !groupName || !loanStatus || !totalSavingAmount) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Create new saving document
    const newSaving = new Saving({
      loanId,
      groupId,
      bankName,
      groupName,
      loanStatus,
      withdrawStatus,
      totalSavingAmount,
      memberList,
    });

    await newSaving.save();
    res.status(201).json({ message: "Saving entry created successfully", saving: newSaving });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get all savings
// @route GET /api/savings
// @access Public
const getAllSavings = async (req, res) => {
  try {
    const savings = await Saving.find().populate("loanId groupId memberList.memberId");
    res.status(200).json(savings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get a single saving by ID
// @route GET /api/savings/:id
// @access Public
const getSavingByCrp = async (req, res) => {
  try {
    const saving = await Saving.findById(req.params.id).populate("loanId groupId memberList.memberId");
    if (!saving) {
      return res.status(404).json({ message: "Saving entry not found" });
    }
    res.status(200).json(saving);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createSaving, getAllSavings, getSavingByCrp};
