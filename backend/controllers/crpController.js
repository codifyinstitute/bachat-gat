// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const CRP = require("../models/CRP"); // Example CRP model

// // CRP login
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const crp = await CRP.findOne({ email });
//     if (!crp) return res.status(404).json({ message: "CRP not found" });

//     const isPasswordValid = await bcrypt.compare(password, crp.password);
//     if (!isPasswordValid)
//       return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: crp._id, role: "crp" },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1d",
//       }
//     );

//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Get CRP profile
// exports.getProfile = async (req, res) => {
//   try {
//     const crp = await CRP.findById(req.user.id);
//     if (!crp) return res.status(404).json({ message: "CRP not found" });

//     res.json(crp);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Update CRP profile
// exports.updateProfile = async (req, res) => {
//   const { name, phone } = req.body;

//   try {
//     const crp = await CRP.findByIdAndUpdate(
//       req.user.id,
//       { name, phone },
//       { new: true }
//     );

//     if (!crp) return res.status(404).json({ message: "CRP not found" });

//     res.json({ message: "Profile updated successfully", crp });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const CRP = require("../models/CRP");

// CRP login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const crp = await CRP.findOne({ email });
    if (!crp) return res.status(404).json({ message: "CRP not found" });

    const isPasswordValid = await bcrypt.compare(password, crp.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: crp._id, name: crp.name, mobile: crp.mobile, role: "crp" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get CRP profile
exports.getProfile = async (req, res) => {
  try {
    const crp = await CRP.findById(req.user.id);
    if (!crp) return res.status(404).json({ message: "CRP not found" });

    res.json(crp);
  } catch (err) {
    console.error("Profile Fetch Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update CRP profile
exports.updateProfile = async (req, res) => {
  const { name, mobile } = req.body;

  try {
    const crp = await CRP.findByIdAndUpdate(
      req.user.id,
      { name, mobile },
      { new: true, runValidators: true }
    );

    if (!crp) return res.status(404).json({ message: "CRP not found" });

    res.json({ message: "Profile updated successfully", crp });
  } catch (err) {
    console.error("Profile Update Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
