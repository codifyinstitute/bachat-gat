const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");
const auth = require("../middleware/auth");

// Collection routes
router.post("/", auth(["crp"]), collectionController.initializeCollection);

router.post(
  "/:collectionId/payments/:memberId",
  auth(["crp"]),
  collectionController.recordPayment
);

router.get(
  "/monthly",
  auth(["admin", "crp"]),
  collectionController.getMonthlyCollections
);

router.get(
  "/stats",
  auth(["admin", "crp"]),
  collectionController.getCollectionStats
);

router.get("/:id", auth(["admin", "crp"]), collectionController.getCollection);

router.get("/", collectionController.getAllCollections);

router.post(
  "/:id/approve",
  auth(["admin"]),
  collectionController.approveCollection
);

module.exports = router;
