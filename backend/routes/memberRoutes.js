const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const auth = require("../middleware/auth");
const upload = require("../config/multer");

// Configure multer for multiple file uploads
const memberUpload = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "guarantorPhoto", maxCount: 1 },
  { name: "guarantorCheque", maxCount: 1 },
  { name: "extraDocuments", maxCount: 5 },
]);

// Member routes
router.post("/", auth(["crp"]), memberUpload, memberController.createMember);

router.put("/:id", auth(["crp"]), memberUpload, memberController.updateMember);

router.get("/:id", auth(["admin", "crp"]), memberController.getMember);

router.get("/", auth(["admin", "crp"]), memberController.getAllMembers);

router.delete("/:id", auth(["admin", "crp"]), memberController.deleteMember);

module.exports = router;
