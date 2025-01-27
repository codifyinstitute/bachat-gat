// models/Loan.js
const mongoose = require('mongoose');

const repaymentScheduleSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    installments: [{
        installmentNumber: Number,
        dueDate: Date,
        amount: Number,
        principal: Number,
        interest: Number,
        status: {
            type: String,
            enum: ['pending', 'paid', 'overdue'],
            default: 'pending'
        },
        paidAmount: {
            type: Number,
            default: 0
        },
        paidDate: Date
    }],
    totalAmount: Number,
    paidAmount: {
        type: Number,
        default: 0
    }
});

const loanSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    perMemberAmount: {
        type: Number,
        required: true
    },
    interestRate: {
        type: Number,
        required: true
    },
    termMonths: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    repaymentSchedules: [repaymentScheduleSchema],
    status: {
        type: String,
        enum: ['pending', 'approved', 'active', 'completed', 'defaulted'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedDate: Date,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CRP',
        required: true
    }
}, { timestamps: true });

// Middleware to validate loan constraints
loanSchema.pre('save', async function(next) {
    if (this.isModified('totalAmount') || this.isModified('repaymentSchedules')) {
        const group = await mongoose.model('Group').findById(this.groupId);
        if (!group) {
            throw new Error('Group not found');
        }

        // Validate member count matches group members
        if (this.repaymentSchedules.length !== group.members.length) {
            throw new Error('Repayment schedules must be created for all group members');
        }

        // Validate total amount matches per member amount
        if (this.totalAmount !== this.perMemberAmount * group.members.length) {
            throw new Error('Total amount must equal per member amount times number of members');
        }
    }
    next();
});

module.exports = mongoose.model('Loan', loanSchema);
