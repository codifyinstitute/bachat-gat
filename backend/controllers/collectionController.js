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
      const { paymentMethod, transactionId, remarks } = req.body;

      const collection = await Collection.findById(collectionId).populate("groupId");
      if (!collection) {
        return res.status(404).json({ message: "Collection not found. Please check the collection ID." });
      }

      const payment = collection.payments.find(p => p.memberId.toString() === memberId);
      if (!payment) {
        return res.status(404).json({ message: "Payment record not found. Please check the member ID." });
      }

      // ✅ Check if the payment is already made
      if (payment.status === "paid") {
        return res.status(400).json({ message: "Payment already completed for this installment." });
      }

      const group = await Group.findById(collection.groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found. Please check the group ID." });
      }

      // Proceed with payment processing
      group.savingsBalance -= payment.savingsAmount;
      payment.paymentMethod = paymentMethod || payment.paymentMethod;
      payment.transactionId = transactionId || payment.transactionId;
      payment.remarks = remarks || payment.remarks;
      payment.status = "paid";
      payment.paymentDate = new Date();

      await MemberStatement.create({
        memberId,
        transactionType: "savings_withdrawal",
        amount: payment.savingsAmount,
        transactionDate: new Date(),
        description: `Savings withdrawn from Group(${group.name})`,
      });

      await GroupStatement.create({
        groupId: group._id,
        transactionType: "savings_withdrawal",
        amount: -payment.savingsAmount,
        transactionDate: new Date(),
        description: `Savings given to Member(${memberId})`,
      });

      const loan = await Loan.findById(payment.loanId);
      const memberSchedule = loan.repaymentSchedules.find(schedule => schedule.memberId.toString() === memberId);
      if (!memberSchedule) {
        return res.status(404).json({ message: "Repayment schedule not found for this member." });
      }

      const installment = memberSchedule.installments.find(inst => inst.installmentNumber === payment.installmentNumber);
      if (!installment) {
        return res.status(404).json({ message: "Installment not found. Please verify the installment number." });
      }

      installment.status = "paid";
      installment.paidAmount = payment.emiAmount;
      installment.paidDate = payment.paymentDate;
      memberSchedule.paidAmount += payment.emiAmount;

      payment.paidEmi = payment.emiAmount;
      payment.outstandingEmi = memberSchedule.totalAmount - memberSchedule.paidAmount;
      payment.pendingEmi = Math.max(0, payment.outstandingEmi);

      // Check if all installments are paid
      const allPaid = memberSchedule.installments.every(inst => inst.status === "paid");
      if (allPaid) {
        memberSchedule.status = "closed";
      }

      collection.status = collection.payments.every(p => p.status === "paid") ? "completed" : "partial";

      await Promise.all([collection.save(), loan.save(), group.save()]);

      await collection.populate([
        { path: "groupId", select: "name" },
        { path: "payments.memberId", select: "name mobileNumber" },
      ]);

      res.json({
        message: "Payment recorded successfully. Loan updated and savings withdrawn.",
        collection,
      });
    } catch (error) {
      console.error("Payment Error:", error); // Logs the exact error in the backend
      res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
  },

  // forecloseLoan: async (req, res) => {
  //   try {
  //     const { loanId, memberId } = req.params;
  //     const foreclosureCharge = 4545; // Foreclosure charge (adjust if needed)

  //     console.log(`Processing foreclosure for Loan: ${loanId}, Member: ${memberId}`);

  //     // Find the loan
  //     let loan = await Loan.findOne({ _id: loanId });
  //     if (!loan) {
  //       return res.status(404).json({ message: "Loan not found" });
  //     }

  //     // Find the member's repayment schedule
  //     let memberSchedule = loan.repaymentSchedules.find(
  //       (schedule) => schedule.memberId.toString() === memberId
  //     );
  //     if (!memberSchedule) {
  //       return res.status(404).json({ message: "Member repayment schedule not found" });
  //     }

  //     // Update each pending installment
  //     let totalPendingAmount = 0;
  //     memberSchedule.installments.forEach((installment) => {
  //       if (installment.status !== "paid") {
  //         totalPendingAmount += installment.amount;
  //         installment.status = "paid";
  //         installment.paidAmount = installment.amount;
  //         installment.paidDate = new Date();
  //       }
  //     });

  //     // Add foreclosure charge to the total
  //     const totalPayable = totalPendingAmount + foreclosureCharge;

  //     // Save the updated loan
  //     await loan.save();

  //     console.log(`Loan foreclosed successfully for member: ${memberId}, Total Payable: ${totalPayable}`);

  //     res.json({
  //       message: "Loan foreclosed successfully for this member",
  //       totalPayable: totalPayable.toFixed(2),
  //       foreclosureCharge: foreclosureCharge,
  //     });
  //   } catch (error) {
  //     console.error("Error in foreclosure:", error);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // },

  forecloseLoan: async (req, res) => {
    try {
      const { loanId, memberId } = req.params;
      const foreclosureCharge = req.body.forcloseAmount || 0; 

      console.log(`Processing foreclosure for Loan: ${loanId}, Member: ${memberId},foreclose: ${foreclosureCharge}`);

      // Find the loan
      let loan = await Loan.findOne({ _id: loanId });
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }

      // Find the member's repayment schedule
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

      // Add foreclosure charge to the total
      const totalPayable = totalPendingAmount + foreclosureCharge;

      // Save the updated loan
      await loan.save();

      console.log(`Loan foreclosed successfully for member: ${memberId}, Total Payable: ${totalPayable}`);

      // Check if the member exists in any collection and update status
      const collections = await Collection.find({ "payments.memberId": memberId });

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

  getSavingsAmountByGroup : async (req, res) => {
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
};

module.exports = collectionController;
