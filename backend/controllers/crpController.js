const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const CRP = require("../models/CRP");
const Group = require("../models/Group");

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
// exports.getAllMembersCreatedByCRP = async (req, res) => {
//   try {
//     // Find all groups created by the logged-in CRP

//     const groups = await Group.find({ createdBy: id }).populate(
//       "members.member",
//       "name mobileNumber"
//     );
//     console.log("id shit " + req.user.id);
//     if (!groups.length) {
//       return res.status(404).json({ message: "No groups found for this CRP" });
//     }

//     // Collect all members from the groups
//     let allMembers = [];
//     groups.forEach((group) => {
//       allMembers = [...allMembers, ...group.members];
//     });

//     // Ensure unique members in case of duplicates
//     allMembers = Array.from(
//       new Set(allMembers.map((m) => m.member.toString()))
//     ).map((id) => allMembers.find((m) => m.member.toString() === id));

//     // Return the members
//     res.json({
//       message: "Members fetched successfully",
//       members: allMembers,
//     });
//   } catch (err) {
//     console.error("Fetch Members Error:", err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// Get all CRPs

// exports.getAllMembersCreatedByCRP = async (req, res) => {
//   try {
//     const crpId = req.user.id; // Get the CRP ID from the authenticated user

//     // Find all groups created by the logged-in CRP
//     const groups = await Group.find({ createdBy: crpId }).populate(
//       "members.member",
//       "name mobileNumber"
//     );

//     if (!groups.length) {
//       return res.status(404).json({ message: "No groups found for this CRP" });
//     }

//     // Collect all members from the groups
//     let allMembers = [];
//     groups.forEach((group) => {
//       allMembers = [...allMembers, ...group.members];
//     });

//     // Ensure unique members in case of duplicates
//     allMembers = Array.from(
//       new Set(allMembers.map((m) => m.member.toString()))
//     ).map((id) => allMembers.find((m) => m.member.toString() === id));

//     // Return the members
//     res.json({
//       message: "Members fetched successfully",
//       members: allMembers,
//     });
//   } catch (err) {
//     console.error("Fetch Members Error:", err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const Member = require("../models/Member");

exports.getAllMembersCreatedByCRP = async (req, res) => {
  try {
    const crpId = req.user.id; // Get the CRP ID from authenticated user

    // Find all members where `createdBy` matches the logged-in CRP
    const members = await Member.find({ createdBy: crpId }).select(
      "name mobileNumber aadharNo panNo"
    );

    if (!members.length) {
      return res.status(404).json({ message: "No members found for this CRP" });
    }

    res.json({
      message: "Members fetched successfully",
      members,
    });
  } catch (err) {
    console.error("Fetch Members Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllCRPs = async (req, res) => {
  try {
    const crps = await CRP.find();
    res.json(crps);
  } catch (err) {
    console.error("Fetch All CRPs Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
