// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/database");
// const adminRoutes = require("./routes/adminRoutes");
// const crpRoutes = require("./routes/crpRoutes");
// const fs = require("fs");
// const path = require("path");
// // ... other route imports

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));

// // Routes
// app.use("/api/admin", adminRoutes);
// app.use("/api/crp", crpRoutes);
// app.use("/api/member", require("./routes/memberRoutes"));

// // ... other routes

// // Connect to database
// connectDB();

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// Import required modules
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
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const adminRoutes = require("./routes/adminRoutes");
const crpRoutes = require("./routes/crpRoutes");
// ... other route imports

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/crp", crpRoutes);
app.use("/api/member", require("./routes/memberRoutes"));

// Connect to database
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
