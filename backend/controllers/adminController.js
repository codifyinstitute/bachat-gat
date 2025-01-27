// const Admin = require("../models/Admin");
// const CRP = require("../models/CRP");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");

// const adminController = {
//   login: async (req, res) => {
//     try {
//       const { username, password } = req.body;
//       const admin = await Admin.findOne({ username });

//       if (!admin || !(await bcrypt.compare(password, admin.password))) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }

//       const token = jwt.sign(
//         { id: admin._id, role: "admin" },
//         process.env.JWT_SECRET,
//         { expiresIn: "24h" }
//       );

//       res.json({ token });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   },

//   createCRP: async (req, res) => {
//     try {
//       const { name, mobile, email, username, password } = req.body;

//       const crp = new CRP({
//         name,
//         mobile,
//         email,
//         username,
//         password,
//         createdBy: req.user.id,
//       });

//       await crp.save();
//       res.status(201).json({ message: "CRP created successfully", crp });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   },
// };

// module.exports = adminController;
const Admin = require("../models/Admin");
const CRP = require("../models/CRP");
const jwt = require("jsonwebtoken");

const adminController = {
  // Login Controller
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find the admin by username
      const admin = await Admin.findOne({ username });

      // Check if admin exists and if passwords match
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: admin._id, role: "admin" },
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

      const crp = new CRP({
        name,
        mobile,
        email,
        username,
        password, // Store plain-text password
        createdBy: req.user.id,
      });

      // Save the CRP to the database
      await crp.save();
      console.log(req.body);
      res.status(201).json({ message: "CRP created successfully", crp });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = adminController;
