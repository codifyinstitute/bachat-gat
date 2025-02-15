const Collection = require("../models/Collection");
const Group = require("../models/Group");
const Loan = require("../models/Loan");
const Member = require("../models/Member");
const mongoose = require("mongoose")
const MemberStatement = require("../models/MemberStatement");
const GroupStatement = require("../models/GroupStatement");

const collectionController = {
  initializeCollection: async (req, res) => {
    try {
      const { groupId, collectionDate, savingsAmount } = req.body;

      // If savingsAmount is not provided, set it to a default value (e.g., 0)
      const savingsAmountValue = savingsAmount || 0;

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
      const payments = group.members
        .map((member) => {
          const memberSchedule = loan.repaymentSchedules.find(
            (schedule) => schedule.memberId.toString() === member.member._id.toString()
          );

          if (!memberSchedule) {
            console.log(`No repayment schedule found for member (${member.member._id})`);
            return null;
          }

          // Find both paid and pending installments
          const currentInstallment = memberSchedule.installments.find(
            (inst) => inst.status === "pending"
          ) || memberSchedule.installments.find(
            (inst) => inst.status === "paid"
          );


          // If no installment is found, exclude this member
          if (!currentInstallment) {
            console.log(`No installments found for member (${member.member._id}), skipping.`);
            return null;
          }

          return {
            memberId: member.member._id,
            loanId: loan._id,
            installmentNumber: currentInstallment.installmentNumber, // Ensure always present
            emiAmount: currentInstallment.amount,
            savingsAmount: savingsAmountValue,
            totalAmount: currentInstallment.amount + savingsAmountValue,
            status: currentInstallment.status, // Use "paid" if already paid, "pending" otherwise
          };
        })
        .filter((payment) => payment !== null); // Remove invalid entries




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

  recordPayment: async (req, res) => {
    try {
      const { collectionId, memberId } = req.params;
      const { paymentMethod, transactionId, remarks, latePaymentCharge } = req.body;

      // Validate parameters
      if (!collectionId || !memberId) {
        return res.status(400).json({
          message: "Collection ID and Member ID are required"
        });
      }

      // Find collection with proper error handling
      const collection = await Collection.findById(collectionId)
        .populate("groupId")
        .exec();

      if (!collection) {
        return res.status(404).json({
          message: "Collection not found. Please check the collection ID."
        });
      }

      // Find payment record for the member
      const payment = collection.payments.find(
        p => p.memberId.toString() === memberId
      );

      if (!payment) {
        return res.status(404).json({
          message: "Payment record not found. Please check the member ID."
        });
      }

      // Check if payment is already made
      if (payment.status === "paid") {
        return res.status(400).json({
          message: "Payment already completed for this installment."
        });
      }

      // Find group
      const group = await Group.findById(collection.groupId);
      if (!group) {
        return res.status(404).json({
          message: "Group not found. Please check the group ID."
        });
      }

      // Begin transaction
      const session = await mongoose.startSession();
      await session.startTransaction();

      try {

        group.savingsBalance -= payment.savingsAmount;


        // Update payment details
        payment.paymentMethod = paymentMethod;
        payment.transactionId = transactionId;
        payment.remarks = remarks;
        payment.latePaymentCharge = parseFloat(latePaymentCharge) || 0;
        payment.status = "paid";
        payment.paymentDate = new Date();


        // Record savings withdrawal
        if (payment.savingsAmount > 0) {
          await MemberStatement.create([{
            memberId,
            transactionType: "savings_withdrawal",
            amount: payment.savingsAmount,
            transactionDate: new Date(),
            description: `Savings withdrawn from Group(${group.name})`
          }], { session });

          await GroupStatement.create([{
            groupId: group._id,
            transactionType: "savings_withdrawal",
            amount: -payment.savingsAmount,
            transactionDate: new Date(),
            description: `Savings given to Member(${memberId})`
          }], { session });
        }

        // Update loan details
        const loan = await Loan.findById(payment.loanId);
        if (!loan) {
          throw new Error("Loan not found");
        }

        const memberSchedule = loan.repaymentSchedules.find(
          schedule => schedule.memberId.toString() === memberId
        );

        if (!memberSchedule) {
          throw new Error("Repayment schedule not found for this member");
        }

        const installment = memberSchedule.installments.find(
          inst => inst.installmentNumber === payment.installmentNumber
        );

        if (!installment) {
          throw new Error("Installment not found");
        }

        // Update installment status
        installment.status = "paid";
        installment.paidAmount = payment.emiAmount;
        installment.paidDate = payment.paymentDate;
        memberSchedule.paidAmount += payment.emiAmount;

        // Update payment amounts
        payment.paidEmi = payment.emiAmount;
        payment.outstandingEmi = memberSchedule.totalAmount - memberSchedule.paidAmount;
        payment.pendingEmi = Math.max(0, payment.outstandingEmi);

        // Check if all installments are paid
        if (memberSchedule.installments.every(inst => inst.status === "paid")) {
          memberSchedule.status = "closed";
        }

        // Update collection status
        collection.status = collection.payments.every(p => p.status === "paid")
          ? "completed"
          : "partial";

        // Save all changes
        await Promise.all([
          collection.save({ session }),
          loan.save({ session }),
          group.save({ session })
        ]);

        // Commit transaction
        await session.commitTransaction();

        // Populate response data
        await collection.populate([
          { path: "groupId", select: "name" },
          { path: "payments.memberId", select: "name mobileNumber" }
        ]);

        return res.json({
          message: "Payment recorded successfully",
          collection
        });

      } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }

    } catch (error) {
      console.error("Payment Error:", error);
      return res.status(500).json({
        message: error.message || "An unexpected error occurred while processing payment."
      });
    }
  },

  forecloseLoan: async (req, res) => {
    try {
      const { loanId, memberId } = req.params;
      const foreclosureCharge = req.body.forcloseAmount || 0;

      console.log(`Processing foreclosure for Loan: ${loanId}, Member: ${memberId}, Foreclosure Charge: ${foreclosureCharge}`);

      // Check if the loan exists
      let loan = await Loan.findOne({ _id: loanId });
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }

      // Check if the loan exists in any collection
      const collections = await Collection.find({ "payments.loanId": loanId });

      if (!collections.length) {
        return res.status(400).json({
          message: "Loan not found in any collection. Please initialize the collection first."
        });
      }

      // Find the member's repayment schedule in the loan
      let memberSchedule = loan.repaymentSchedules.find(
        (schedule) => schedule.memberId.toString() === memberId
      );
      if (!memberSchedule) {
        return res.status(404).json({ message: "Member repayment schedule not found" });
      }

      // Update each pending installment
      let totalPendingAmount = 0;
      memberSchedule.installments.forEach((installment) => {
        if (installment.status !== "paid") {
          totalPendingAmount += installment.amount;
          installment.status = "paid";
          installment.paidAmount = installment.amount;
          installment.paidDate = new Date();
        }
      });

      // Add foreclosure charge to total
      const totalPayable = totalPendingAmount + foreclosureCharge;

      // Save the updated loan
      await loan.save();

      console.log(`Loan foreclosed successfully for Member: ${memberId}, Total Payable: ${totalPayable}`);

      // Update payments in the collection
      for (let collection of collections) {
        collection.payments.forEach((payment) => {
          if (payment.memberId.toString() === memberId) {
            payment.status = "paid"; // Update payment status
          }
        });

        // Recalculate collection totals
        collection.totalEmiCollected = collection.payments.reduce(
          (sum, payment) => sum + (payment.status === "paid" ? payment.emiAmount : 0),
          0
        );
        collection.totalSavingsCollected = collection.payments.reduce(
          (sum, payment) => sum + (payment.status === "paid" ? payment.savingsAmount : 0),
          0
        );

        // If all payments are paid, mark collection as "completed"
        if (collection.payments.every((payment) => payment.status === "paid")) {
          collection.status = "completed";
        } else {
          collection.status = "partial";
        }

        await collection.save();
      }

      // Check if all installments in all repayment schedules are paid
      const allPaid = loan.repaymentSchedules.every(schedule =>
        schedule.installments.every(installment => installment.status === "paid")
      );

      if (allPaid) {
        loan.status = "closed";
        await loan.save();
        console.log(`Loan ${loanId} is fully paid and marked as 'closed'.`);
      }

      res.json({
        message: "Loan foreclosed successfully, and member's collection status updated",
        totalPayable: totalPayable.toFixed(2),
        foreclosureCharge: foreclosureCharge,
        loanStatus: loan.status,
      });

    } catch (error) {
      console.error("Error in foreclosure:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },



  getAllCollections: async (req, res) => {
    try {
      const { groupId } = req.query;

      const query = {};
      if (groupId) {
        query.groupId = groupId;
      }

      const collections = await Collection.find(query)
        .populate("groupId", "name")
        .populate("payments.memberId", "name mobileNumber")
        .sort({ collectionDate: -1 });

      res.json(collections);
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
      for (let i = 0; i < collection.payments.length; i++) {
        const payment = collection.payments[i];
        if (payment.status !== "completed") {
          console.log(`Status of payment ${i + 1}:`, payment.status);
          return res.status(400).json({
            message: "Only completed collections can be approved",
          });
        } else {
          collection.status = "completed";
        }
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

  getSavingsAmountByGroup: async (req, res) => {
    try {
      const { groupId } = req.params;

      // Find the first collection with the given groupId
      const collection = await Collection.findOne({ groupId });

      if (!collection) {
        return res.status(404).json({ message: "Collection is not initialized" });
      }

      // Return the savings amount from the found collection
      res.status(200).json({ savingsAmount: collection.payments[0].savingsAmount });
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getLatePaymentDetailsByMemberId: async (req, res) => {
    try {
      const { memberId } = req.params;

      // Validate memberId
      if (!memberId) {
        return res.status(400).json({ message: "Member ID is required" });
      }

      // Find all collections where the memberId exists in the payments array
      const collections = await Collection.find({
        "payments.memberId": memberId,
      });

      if (!collections || collections.length === 0) {
        return res.status(404).json({ message: "No collections found for this member" });
      }

      // Extract latePaymentCharge and paymentDate for the member from each collection
      const latePaymentDetails = collections
        .map((collection) => {
          const payment = collection.payments.find(
            (p) => p.memberId.toString() === memberId
          );

          if (payment && payment.latePaymentCharge > 0) {
            return {
              collectionId: collection._id, // Include collection ID for reference
              latePaymentCharge: payment.latePaymentCharge,
              paymentDate: payment.paymentDate, // Include payment date
            };
          }
          return null; // Skip collections with no late payment charge
        })
        .filter((detail) => detail !== null); // Remove null entries

      res.status(200).json({
        message: "Late payment details retrieved successfully",
        latePaymentDetails,
      });
    } catch (error) {
      console.error("Error fetching late payment details:", error);
      res.status(500).json({ message: error.message });
    }
  },

  resetTotalSavings: async (req, res) => {
    try {
      const { groupId, loanId } = req.params;

      if (!groupId || !loanId) {
        return res.status(400).json({ message: "groupId and loanId are required" });
      }

      // Find collections matching the given groupId
      const collections = await Collection.find({ groupId });

      if (!collections.length) {
        return res.status(404).json({ message: "No collections found for this groupId" });
      }

      // Filter collections that contain a payment with the specified loanId
      const matchingCollections = collections.filter(collection =>
        collection.payments.some(payment => payment.loanId.toString() === loanId)
      );

      if (!matchingCollections.length) {
        return res.status(404).json({ message: "No matching collections found for this loanId" });
      }

      // Update totalSavingsCollected to 0 for all matched collections
      await Collection.updateMany(
        { _id: { $in: matchingCollections.map(c => c._id) } },
        { $set: { totalSavingsCollected: 0 } }
      );

      res.status(200).json({
        message: "Total savings collected reset to 0 for matching collections",
        updatedCollections: matchingCollections.length,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = collectionController;
