

const Collection = require("../models/Collection");
const Group = require("../models/Group");
const Loan = require("../models/Loan");
const Member = require("../models/Member");

const collectionController = {
  // Initialize collection for a group
  initializeCollection: async (req, res) => {
    try {
      const { groupId, collectionDate } = req.body;

      console.log("Group ID from request:", groupId);

      // Validate group and active loan
      const group = await Group.findById(groupId).populate({
        path: "members.member",
        select: "name mobileNumber", // Make sure this is the information you need
      });

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const loan = await Loan.findOne({
        groupId,
        status: "approved",
      });

      if (!loan) {
        return res
          .status(404)
          .json({ message: "No active loan found for this group" });
      }

      const date = new Date(collectionDate);
      const collectionMonth = date.toLocaleString("default", { month: "long" });
      const collectionYear = date.getFullYear();

      // Check if collection already exists for this month
      const existingCollection = await Collection.findOne({
        groupId,
        collectionMonth,
        collectionYear,
      });

      if (existingCollection) {
        return res.status(400).json({
          message: "Collection already initialized for this month",
        });
      }

      // Initialize empty payments for each member
      const payments = group.members.map((member) => {
        const memberSchedule = loan.repaymentSchedules.find(
          (schedule) =>
            schedule.memberId.toString() === member.member._id.toString()
        );

        const currentInstallment = memberSchedule.installments.find(
          (inst) => !inst.paidDate && inst.status === "pending"
        );

        return {
          memberId: member.member._id,
          loanId: loan._id,
          installmentNumber: currentInstallment.installmentNumber,
          emiAmount: currentInstallment.amount,
          savingsAmount: 500, // Default savings amount
          totalAmount: currentInstallment.amount + 500,
          status: "pending",
        };
      });

      const collection = new Collection({
        groupId,
        collectionDate: date,
        collectionMonth,
        collectionYear,
        payments,
        createdBy: req.user.id,
      });

      await collection.save();
      await collection.populate([
        { path: "groupId", select: "name" },
        { path: "payments.memberId", select: "name mobileNumber" },
      ]);

      res.status(201).json({
        message: "Collection initialized successfully",
        collection,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Record payment
  recordPayment: async (req, res) => {
    try {
      const { collectionId, memberId } = req.params;
      const { paymentMethod, transactionId, remarks } = req.body;

      const collection = await Collection.findById(collectionId);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }

      const payment = collection.payments.find(
        (p) => p.memberId.toString() === memberId
      );

      if (!payment) {
        return res.status(404).json({ message: "Payment record not found" });
      }

      // Update payment details
      payment.paymentMethod = paymentMethod || payment.paymentMethod; // Update only if provided
      payment.transactionId = transactionId || payment.transactionId;
      payment.remarks = remarks || payment.remarks;
      payment.status = "completed";
      payment.paymentDate = new Date();

      // Update loan repayment schedule
      const loan = await Loan.findById(payment.loanId);
      const memberSchedule = loan.repaymentSchedules.find(
        (schedule) => schedule.memberId.toString() === memberId
      );

      const installment = memberSchedule.installments.find(
        (inst) => inst.installmentNumber === payment.installmentNumber
      );

      installment.status = "paid";
      installment.paidAmount = payment.emiAmount;
      installment.paidDate = payment.paymentDate;
      memberSchedule.paidAmount += payment.emiAmount;

      // Update collection status
      const allPaid = collection.payments.every(
        (p) => p.status === "completed"
      );
      collection.status = allPaid ? "completed" : "partial";

      await Promise.all([collection.save(), loan.save()]);

      await collection.populate([
        { path: "groupId", select: "name" },
        { path: "payments.memberId", select: "name mobileNumber" },
      ]);

      res.json({
        message: "Payment recorded successfully",
        collection,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get monthly collection list
  getMonthlyCollections: async (req, res) => {
    try {
      const { month, year } = req.query;

      const collections = await Collection.find({
        collectionMonth: month,
        collectionYear: parseInt(year),
        createdBy: req.user.id,
      })
        .populate("groupId", "name")
        .populate("payments.memberId", "name mobileNumber")
        .sort({ collectionDate: -1 });

      res.json(collections);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get collection details
  getCollection: async (req, res) => {
    try {
      const collection = await Collection.findById(req.params.id)
        .populate("groupId", "name")
        .populate("payments.memberId", "name mobileNumber guarantor")
        .populate("createdBy", "name")
        .populate("approvedBy", "username");

      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }

      res.json(collection);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Approve collection
  approveCollection: async (req, res) => {
    try {
      const collection = await Collection.findById(req.params.id);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }

      if (collection.status !== "completed") {
        return res.status(400).json({
          message: "Only completed collections can be approved",
        });
      }

      collection.approvedBy = req.user.id;
      collection.approvedDate = new Date();
      await collection.save();

      res.json({
        message: "Collection approved successfully",
        collection,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get collection statistics
  getCollectionStats: async (req, res) => {
    try {
      const { month, year } = req.query;

      const stats = await Collection.aggregate([
        {
          $match: {
            collectionMonth: month,
            collectionYear: parseInt(year),
            createdBy: req.user._id,
          },
        },
        {
          $group: {
            _id: null,
            totalEMICollected: { $sum: "$totalEmiCollected" },
            totalSavingsCollected: { $sum: "$totalSavingsCollected" },
            completedCollections: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            partialCollections: {
              $sum: { $cond: [{ $eq: ["$status", "partial"] }, 1, 0] },
            },
          },
        },
      ]);

      res.json(
        stats[0] || {
          totalEMICollected: 0,
          totalSavingsCollected: 0,
          completedCollections: 0,
          partialCollections: 0,
        }
      );
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = collectionController;
