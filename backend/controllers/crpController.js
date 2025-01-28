const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const CRP = require("../models/CRP");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find CRP by email
    const crp = await CRP.findOne({ email });
    if (!crp) return res.status(404).json({ message: "CRP not found" });

    // Compare entered password with stored password directly
    const isPasswordValid = password === crp.password;
    console.log("Entered password:", password);
    console.log("Stored password:", crp.password);
    console.log("Password valid:", isPasswordValid); // This should log true if passwords match

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
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


// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   try {
//     const crp = await CRP.findOne({ email });
//     if (!crp) return res.status(404).json({ message: "CRP not found" });

//     // Log entered and stored passwords for debugging
//     console.log("Entered password:", password);
//     console.log("Stored hashed password:", crp.password);

//     // Compare the entered password with the stored hash (async)
//     const isPasswordValid = await bcrypt.compare(password, crp.password);
//     console.log("Password valid:", isPasswordValid); // Should log `true` if passwords match

//     if (!isPasswordValid)
//       return res.status(401).json({ message: "Invalid credentials" });

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: crp._id, name: crp.name, mobile: crp.mobile, role: "crp" },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ token });
//   } catch (err) {
//     console.error("Login Error:", err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };

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
