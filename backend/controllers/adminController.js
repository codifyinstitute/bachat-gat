const Admin = require("../models/Admin");
const CRP = require("../models/CRP");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      const crp = new CRP({
        name,
        mobile,
        email,
        username,
        password: hashedPassword, // Save hashed password
        createdBy: req.user.id,
      });

      await crp.save();
      console.log(req.body);
      res.status(201).json({ message: "CRP created successfully", crp });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = adminController;
