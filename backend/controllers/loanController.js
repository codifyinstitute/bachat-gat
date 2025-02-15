const Loan = require("../models/Loan");
const Group = require("../models/Group");
const Member = require("../models/Member");
const pdfKit = require("pdfkit");
const DeletedLoan = require("../models/DeleteLoan");
const fs = require("fs");

const loanController = {
  // Calculate EMI
  calculateEMI: (principal, rate, time) => {
    const r = rate / (12 * 100); // monthly interest rate
    const n = time; // number of months
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi * 100) / 100; // round to 2 decimal places
  },

  // Generate repayment schedule for a member
  generateRepaymentSchedule: (memberId, amount, rate, months, startDate) => {
    const emi = loanController.calculateEMI(amount, rate, months);
    const schedule = [];
    let remainingPrincipal = amount;
    let currentDate = new Date(startDate);

    for (let i = 1; i <= months; i++) {
      const interest = (remainingPrincipal * rate) / (12 * 100);
      const principal = emi - interest;
      remainingPrincipal -= principal;

      schedule.push({
        installmentNumber: i,
        dueDate: new Date(currentDate),
        amount: emi,
        principal: Math.round(principal * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        status: "pending",
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return {
      memberId,
      installments: schedule,
      totalAmount: amount,
      paidAmount: 0,
    };
  },

  createLoan: async (req, res) => {
    try {
      const {
        groupId,
        totalAmount,
        interestRate,
        termMonths,
        startDate,
        bankDetails,
        loanAccountNo,
        savingAccountNo,
      } = req.body;

      // Validate group exists and is active
      const group = await Group.findOne({
        _id: groupId,
        status: "active",
      }).populate("members.member");

      if (!group) {
        return res.status(404).json({ message: "Active group not found" });
      }

      // Validate Bank Details
      if (
        !bankDetails ||
        !bankDetails.name ||
        !bankDetails.ifsc ||
        !bankDetails.branch
      ) {
        return res
          .status(400)
          .json({ message: "Complete bank details are required" });
      }

      // Validate Account Numbers
      if (!loanAccountNo || !savingAccountNo) {
        return res.status(400).json({ message: "Both loan and saving account numbers are required" });
      }

      // Check if the group already has a loan with the same bank details
      const existingLoan = await Loan.findOne({
        groupId: groupId,
        "bankDetails.name": bankDetails.name,
        "bankDetails.ifsc": bankDetails.ifsc,
        "bankDetails.branch": bankDetails.branch,
      });

      if (existingLoan) {
        return res.status(400).json({
          message: "This group has already taken a loan from the same bank",
        });
      }

      // Calculate per member amount
      const memberCount = group.members.length;
      const perMemberAmount = totalAmount / memberCount;

      // Generate repayment schedules for each member
      const repaymentSchedules = group.members.map((member) =>
        loanController.generateRepaymentSchedule(
          member.member._id,
          perMemberAmount,
          interestRate,
          termMonths,
          startDate
        )
      );

      const loan = new Loan({
        groupId,
        totalAmount,
        perMemberAmount,
        interestRate,
        termMonths,
        startDate,
        repaymentSchedules,
        createdBy: req.user.id,
        bankDetails, // Save bank details
        loanAccountNo,
        savingAccountNo,
      });

      await loan.save();

      // Populate member details
      await loan.populate([
        { path: "groupId", select: "name" },
        { path: "repaymentSchedules.memberId", select: "name mobileNumber" },
      ]);

      res.status(201).json({
        message: "Loan created successfully",
        loan,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  generateRepaymentSchedule: (
    memberId,
    perMemberAmount,
    interestRate,
    termMonths,
    startDate
  ) => {
    const installments = [];
    const monthlyInterestRate = interestRate / 100 / 12;
    const emi =
      (perMemberAmount * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -termMonths));

    for (let i = 1; i <= termMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      installments.push({
        installmentNumber: i,
        dueDate,
        amount: emi.toFixed(2),
        principal: (emi - perMemberAmount * monthlyInterestRate).toFixed(2),
        interest: (perMemberAmount * monthlyInterestRate).toFixed(2),
        status: "pending",
      });
    }

    return {
      memberId,
      installments,
      totalAmount: (emi * termMonths).toFixed(2),
      paidAmount: 0,
    };
  },

  // Approve loan
  approveLoan: async (req, res) => {
    try {
      const { loanId } = req.params;

      const loan = await Loan.findById(loanId);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }

      if (loan.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Loan is not in pending status" });
      }

      loan.status = "approved";
      loan.approvedBy = req.user.id;
      loan.approvedDate = new Date();

      await loan.save();

      res.json({
        message: "Loan approved successfully",
        loan,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get loan details
  getLoan: async (req, res) => {
    try {
      const loan = await Loan.findById(req.params.id)
        .populate("groupId", "name")
        .populate("repaymentSchedules.memberId", "name mobileNumber")
        .populate("approvedBy", "username")
        .populate("createdBy", "name");

      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }

      res.json(loan);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },


  getAllLoans: async (req, res) => {
    try {
      let query = {};

      // If the user is a CRP, show only their loans
      if (req.user.role === "crp") {
        query = { createdBy: req.user.id };
      }

      const loans = await Loan.find(query)
        .populate("groupId", "name")
        .populate("repaymentSchedules.memberId", "name mobileNumber")
        .populate("approvedBy", "username")
        .populate("createdBy", "name");

      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },


  getLoanCounts: async (req, res) => {
    try {
      console.log("Fetching loan counts...");
      const approvedCount = await Loan.countDocuments({ status: "approved" });
      const completedCount = await Loan.countDocuments({ status: "completed" });
      const pendingCount = await Loan.countDocuments({ status: "pending" });

      console.log("Counts fetched:", { approvedCount, completedCount, pendingCount });

      res.status(200).json({
        success: true,
        data: {
          approved: approvedCount,
          completed: completedCount,
          pending: pendingCount,
        },
      });
    } catch (error) {
      console.error("Error fetching loan counts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch loan counts",
        error: error.message,
      });
    }
  },



  // Generate loan repayment schedule PDF
  generateRepaymentSchedulePDF: async (req, res) => {
    try {
      const { loanId, memberId } = req.params;

      const loan = await Loan.findById(loanId)
        .populate("groupId", "name")
        .populate("repaymentSchedules.memberId", "name mobileNumber");

      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }

      const memberSchedule = loan.repaymentSchedules.find(
        (schedule) => schedule.memberId._id.toString() === memberId
      );

      if (!memberSchedule) {
        return res.status(404).json({ message: "Member schedule not found" });
      }

      // Generate PDF for repayment schedule
      const doc = new pdfKit();
      const filePath = `./${memberId}_repayment_schedule.pdf`;

      doc.pipe(fs.createWriteStream(filePath));

      doc
        .fontSize(12)
        .text(
          `Repayment Schedule for Member: ${memberSchedule.memberId.name}`,
          {
            align: "center",
          }
        );

      memberSchedule.installments.forEach((installment) => {
        doc.text(
          `Installment #${installment.installmentNumber
          } - Due: ${installment.dueDate.toLocaleDateString()}`
        );
        doc.text(
          `Amount: ₹${installment.amount} | Principal: ₹${installment.principal} | Interest: ₹${installment.interest}`
        );
        doc.text("--------------------------");
      });

      doc.end();

      res.download(filePath, () => {
        fs.unlinkSync(filePath); // Remove the file after download
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  deleteLoan: async (req, res) => {
    try {
      const { loanId } = req.params;
  
      // Check if loan exists
      const loan = await Loan.findById(loanId);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
  
      // Save the loan data in DeletedLoan before deleting
      const deletedLoan = new DeletedLoan({
        originalLoanId: loan._id,
        groupId: loan.groupId,
        totalAmount: loan.totalAmount,
        perMemberAmount: loan.perMemberAmount,
        interestRate: loan.interestRate,
        termMonths: loan.termMonths,
        startDate: loan.startDate,
        bankDetails: loan.bankDetails,
        repaymentSchedules: loan.repaymentSchedules,
        status: loan.status,
        approvedBy: loan.approvedBy,
        approvedDate: loan.approvedDate,
        createdBy: loan.createdBy,
        loanAccountNo: loan.loanAccountNo,
        savingAccountNo: loan.savingAccountNo,
        deletedBy: loan.approvedBy, // Track who deleted the loan
      });
  
      await deletedLoan.save();
  
      // Delete the original loan
      await Loan.findByIdAndDelete(loanId);
  
      res.status(200).json({ message: "Loan deleted successfully and backed up" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting loan", error: error.message });
    }
  },
};

module.exports = loanController;
