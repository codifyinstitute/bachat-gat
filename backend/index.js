require("dotenv").config();
const groupRoutes = require("./routes/groupRoutes");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const adminRoutes = require("./routes/adminRoutes");
const crpRoutes = require("./routes/crpRoutes");
const loanRoutes = require("./routes/loanRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const bankRoutes = require("./routes/bankRoutes");
const withdrawRoutes = require('./routes/savingWithdrawRoute')
const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Your frontend's origin
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
app.use("/api/loan", loanRoutes); // Use loan routes
app.use("/api/collection", require("./routes/collectionRoutes")); // Import collection routes
app.use("/api/banks", bankRoutes);
app.use("/api/withdraw",withdrawRoutes)
// Connect to database
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
