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
  { name: "extraDocuments_0", maxCount: 1 },
  { name: "extraDocuments_1", maxCount: 1 },
  { name: "extraDocuments_2", maxCount: 1 },
  { name: "extraDocuments_3", maxCount: 1 },




  // const upload = multer({ storage: storage }).array('extraDocuments', 4);
]);

// Member routes
router.post("/", auth(["crp"]), memberUpload, memberController.createMember);

router.put("/:id", auth(["crp"]), memberUpload, memberController.updateMember);

router.get("/:id", auth(["admin", "crp"]), memberController.getMember);

router.get("/", auth(["admin", "crp"]), memberController.getAllMembers);

router.delete("/:id", auth(["admin", "crp"]), memberController.deleteMember);
router.put("/:id/toggle-npa", auth(["crp"]), memberController.toggleNPA);

module.exports = router;

