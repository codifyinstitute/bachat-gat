const { Bank, defaultBanks } = require("../models/bankScema"); // Adjust the path as needed

// Get all banks
const getBanks = async (req, res) => {
  try {
    const banks = await Bank.find();
    res.status(200).json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single bank by ID
const getBankById = async (req, res) => {
  const { id } = req.params;
  try {
    const bank = await Bank.findById(id);
    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }
    res.status(200).json(bank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new bank
const createBank = async (req, res) => {
  const { name, branch, ifsc, interestRate, additionalDetails } = req.body;

  try {
    const bank = new Bank({
      name,
      branch,
      ifsc,
      interestRate,
      additionalDetails,
    });

    await bank.save();
    res.status(201).json({ message: "Bank created successfully", bank });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing bank
const updateBank = async (req, res) => {
  const { id } = req.params;
  const { name, branch, ifsc, interestRate, additionalDetails } = req.body;

  try {
    const bank = await Bank.findByIdAndUpdate(
      id,
      { name, branch, ifsc, interestRate, additionalDetails },
      { new: true }
    );

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res.status(200).json({ message: "Bank updated successfully", bank });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a bank
const deleteBank = async (req, res) => {
  const { id } = req.params;

  try {
    const bank = await Bank.findByIdAndDelete(id);

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res.status(200).json({ message: "Bank deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add default banks to the database
const addDefaultBanks = async (req, res) => {
  try {
    const existingBanks = await Bank.find();

    if (existingBanks.length === 0) {
      await Bank.insertMany(defaultBanks);
      return res
        .status(201)
        .json({ message: "Default banks added successfully" });
    } else {
      res.status(200).json({ message: "Banks already exist in the database" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank,
  addDefaultBanks,
};
