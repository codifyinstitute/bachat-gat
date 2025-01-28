const fs = require("fs");
const path = require("path");

// Define the uploads directory path
const uploadDir = path.join(__dirname, "uploads");

// Check if the 'uploads' directory exists; if not, create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Uploads directory created.");
}

// Rest of your setup
require("dotenv").config();
const groupRoutes = require("./routes/groupRoutes");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const adminRoutes = require("./routes/adminRoutes");
const crpRoutes = require("./routes/crpRoutes");
// ... other route imports

const app = express();

// Middleware
app.use(
  cors({
      origin: "http://localhost:5173", // Your frontend's origin
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/crp", crpRoutes);
app.use("/api/member", require("./routes/memberRoutes"));
app.use("/api/groups", groupRoutes);
// Connect to database
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
