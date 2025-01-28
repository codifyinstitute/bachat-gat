// const Loan = require("../models/Loan");
// const Group = require("../models/Group");
// const Member = require("../models/Member");

// const loanController = {
//   // Calculate EMI
//   calculateEMI: (principal, rate, time) => {
//     const r = rate / (12 * 100); // monthly interest rate
//     const n = time; // number of months
//     const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
//     return Math.round(emi * 100) / 100; // round to 2 decimal places
//   },

//   // Generate repayment schedule for a member
//   generateRepaymentSchedule: (memberId, amount, rate, months, startDate) => {
//     const emi = loanController.calculateEMI(amount, rate, months);
//     const schedule = [];
//     let remainingPrincipal = amount;
//     let currentDate = new Date(startDate);

//     for (let i = 1; i <= months; i++) {
//       const interest = (remainingPrincipal * rate) / (12 * 100);
//       const principal = emi - interest;
//       remainingPrincipal -= principal;

//       schedule.push({
//         installmentNumber: i,
//         dueDate: new Date(currentDate),
//         amount: emi,
//         principal: Math.round(principal * 100) / 100,
//         interest: Math.round(interest * 100) / 100,
//         status: "pending",
//       });

//       currentDate.setMonth(currentDate.getMonth() + 1);
//     }

//     return {
//       memberId,
//       installments: schedule,
//       totalAmount: amount,
//       paidAmount: 0,
//     };
//   },

//   // Create new loan
//   createLoan: async (req, res) => {
//     try {
//       const { groupId, totalAmount, interestRate, termMonths, startDate } =
//         req.body;

//       // Validate group exists and is active
//       const group = await Group.findOne({
//         _id: groupId,
//         status: "active",
//       }).populate("members.member");

//       if (!group) {
//         return res.status(404).json({ message: "Active group not found" });
//       }

//       // Calculate per member amount
//       const memberCount = group.members.length;
//       const perMemberAmount = totalAmount / memberCount;

//       // Generate repayment schedules for each member
//       const repaymentSchedules = group.members.map((member) =>
//         loanController.generateRepaymentSchedule(
//           member.member._id,
//           perMemberAmount,
//           interestRate,
//           termMonths,
//           startDate
//         )
//       );

//       const loan = new Loan({
//         groupId,
//         totalAmount,
//         perMemberAmount,
//         interestRate,
//         termMonths,
//         startDate,
//         repaymentSchedules,
//         createdBy: req.user.id,
//       });

//       await loan.save();

//       // Populate member details
//       await loan.populate([
//         { path: "groupId", select: "name" },
//         { path: "repaymentSchedules.memberId", select: "name mobileNumber" },
//       ]);

//       res.status(201).json({
//         message: "Loan created successfully",
//         loan,
//       });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   },

//   // Approve loan
//   approveLoan: async (req, res) => {
//     try {
//       const { loanId } = req.params;

//       const loan = await Loan.findById(loanId);
//       if (!loan) {
//         return res.status(404).json({ message: "Loan not found" });
//       }

//       if (loan.status !== "pending") {
//         return res
//           .status(400)
//           .json({ message: "Loan is not in pending status" });
//       }

//       loan.status = "approved";
//       loan.approvedBy = req.user.id;
//       loan.approvedDate = new Date();

//       await loan.save();

//       res.json({
//         message: "Loan approved successfully",
//         loan,
//       });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   },

//   // Get loan details
//   getLoan: async (req, res) => {
//     try {
//       const loan = await Loan.findById(req.params.id)
//         .populate("groupId", "name")
//         .populate("repaymentSchedules.memberId", "name mobileNumber")
//         .populate("approvedBy", "username")
//         .populate("createdBy", "name");

//       if (!loan) {
//         return res.status(404).json({ message: "Loan not found" });
//       }

//       res.json(loan);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   },

//   // Get all loans
//   getAllLoans: async (req, res) => {
//     try {
//       const loans = await Loan.find({ createdBy: req.user.id })
//         .populate("groupId", "name")
//         .populate("repaymentSchedules.memberId", "name mobileNumber")
//         .populate("approvedBy", "username")
//         .populate("createdBy", "name");

//       res.json(loans);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   },

//   // Generate loan repayment schedule PDF
//   generateRepaymentSchedulePDF: async (req, res) => {
//     try {
//       const { loanId, memberId } = req.params;

//       const loan = await Loan.findById(loanId)
//         .populate("groupId", "name")
//         .populate("repaymentSchedules.memberId", "name mobileNumber");

//       if (!loan) {
//         return res.status(404).json({ message: "Loan not found" });
//       }

//       const memberSchedule = loan.repaymentSchedules.find(
//         (schedule) => schedule.memberId._id.toString() === memberId
//       );

//       if (!memberSchedule) {
//         return res.status(404).json({ message: "Member schedule not found" });
//       }

//       // Here you would generate and return PDF
//       // This is a placeholder for PDF generation logic
//       res.json({
//         message:
//           "PDF generation endpoint - implement with your preferred PDF library",
//         schedule: memberSchedule,
//       });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   },
// };

// module.exports = loanController;
const Loan = require("../models/Loan");
const Group = require("../models/Group");
const Member = require("../models/Member");
const pdfKit = require("pdfkit");
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

  // Create new loan
  createLoan: async (req, res) => {
    try {
      const {
        groupId,
        totalAmount,
        interestRate,
        termMonths,
        startDate,
        bankDetails,
      } = req.body;

      // Validate group exists and is active
      const group = await Group.findOne({
        _id: groupId,
        status: "active",
      }).populate("members.member");

      if (!group) {
        return res.status(404).json({ message: "Active group not found" });
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
        bankDetails: bankDetails, // Save bank details
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

  // Get all loans
  getAllLoans: async (req, res) => {
    try {
      const loans = await Loan.find({ createdBy: req.user.id })
        .populate("groupId", "name")
        .populate("repaymentSchedules.memberId", "name mobileNumber")
        .populate("approvedBy", "username")
        .populate("createdBy", "name");

      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
          `Installment #${
            installment.installmentNumber
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
};

module.exports = loanController;
