const express = require("express");
const router = express.Router();
const crpController = require("../controllers/crpController");
const auth = require("../middleware/auth");

// CRP routes
router.post("/login", crpController.login);
router.get("/profile", auth(["crp"]), crpController.getProfile);
router.get("/membycrp", auth(["crp"]), crpController.getAllMembersCreatedByCRP);
router.put("/profile", auth(["crp"]), crpController.updateProfile);

module.exports = router;
