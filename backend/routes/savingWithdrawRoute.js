const express = require("express");
const router = express.Router();
const withdrawController = require("../controllers/savingWithdrawController");
const auth = require("../middleware/auth");

router.post("/",auth(['crp']), withdrawController.createSaving);

router.get("/all",withdrawController.getAllSavings);

module.exports = router;