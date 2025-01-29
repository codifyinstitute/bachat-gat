const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const auth = require("../middleware/auth");

// Group routes
router.post("/", auth(["crp"]), groupController.createGroup);

router.post("/:groupId/members", auth(["crp"]), groupController.addMember);

router.put("/:id", auth(["crp"]), groupController.updateGroup);

router.get("/:id", auth(["admin", "crp"]), groupController.getGroup);

router.get("/", auth(["admin"]), groupController.getAllGroups);

router.delete(
  "/:groupId/members/:memberId",
  auth(["crp"]),
  groupController.removeMember
);

router.delete("/:id", auth(["admin", "crp"]), groupController.deactivateGroup);

module.exports = router;
