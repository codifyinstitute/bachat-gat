const Admin = require("../models/Admin");
const CRP = require("../models/CRP");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const adminController = {
  // Login Controller
  // login: async (req, res) => {
  //   try {
  //     const { username, password } = req.body;

  //     // Find the admin by username
  //     const admin = await Admin.findOne({ username });

  //     // Check if admin exists and validate the password
  //     if (!admin || !(await bcrypt.compare(password, admin.password))) {
  //       return res.status(401).json({ message: "Invalid credentials" });
  //     }

  //     // Generate JWT token
  //     const token = jwt.sign(
  //       {
  //         id: admin._id,
  //         name: admin.username || "Admin", // Default to "Admin" if name is not set
  //         role: "admin",
  //         mobile: admin.mobile || "N/A", // Default to "N/A" if mobile is not set
  //       },
  //       process.env.JWT_SECRET,
  //       { expiresIn: "24h" }
  //     );

  //     res.json({ token });
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // },
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find the admin by username
      const admin = await Admin.findOne({ username });

      // Check if admin exists and validate the plain text password
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: admin._id,
          name: admin.username || "Admin", // Include username as "name"
          role: "admin",
          mobile: admin.mobile || "N/A", // Default to "N/A" if mobile is not set
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create CRP Controller
  createCRP: async (req, res) => {
    try {
      const { name, mobile, email, username, password } = req.body;

      // Check if email, username, or mobile already exists (to prevent duplicate key error)
      const existingCRP = await CRP.findOne({
        $or: [{ email }, { mobile }],
      });

      if (existingCRP) {
        return res.status(400).json({
          message: "Email or Mobile number already in use",
        });
      }

      // Hash the password using bcrypt before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new CRP document with hashed password
      const crp = new CRP({
        name,
        mobile,
        email,
        username,
        password, // Store the hashed password
        createdBy: req.user.id,
      });

      await crp.save();
      res.status(201).json({ message: "CRP created successfully", crp });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Duplicate entry detected" });
      }
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = adminController;
