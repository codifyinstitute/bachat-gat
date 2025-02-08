const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const auth = require("../middleware/auth");

// Group routes
router.post("/", auth(["crp"]), groupController.createGroup);

router.post("/:groupId/members", auth(["crp"]), groupController.addMember);

router.put("/:id", auth(["crp"]), groupController.updateGroup);

// router.get("/:id", auth(["admin", "crp"]), groupController.getGroup);

// Define this first to prevent conflicts
router.get(
  "/created-by-crp",
  auth(["crp"]),
  groupController.getGroupsCreatedByCrp
);

// Then define your dynamic route (to prevent misinterpretation)
router.get("/:id", auth(["admin", "crp"]), groupController.getGroup);

router.get("/", auth(["admin"]), groupController.getAllGroups);

router.delete("/:groupId/members/:memberId", groupController.removeMember);

router.delete("/del/:id", groupController.deactivateGroup);

module.exports = router;
