const mongoose = require('mongoose')

const SavingSchema = new mongoose.Schema({
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loan",
        required: true,
    },
    groupId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Group',
        required:true
    },
    bankName:{
        type:String,
        required:true
    },
    groupName:{
        type:String,
        required:true
    },
    loanStatus:{
        type:String,
        required:true
    },
    withdrawStatus:{
        type:String,
        enum:["yes","no"],
        default:"yes"
    },
    totalSavingAmount:{
        type:String,
        required:true
    },
    memberList:[
        {
            memberId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Member",
                required: true,
              },
              name: {
                type: String,
                required: true,
              },
            //   mobileNo: {
            //     type: String,
            //     required: true,
            //   },
              withdrawAmount:{
                type:String,
                required:true
              }
        }
    ]
}, { timestamps: true })
module.exports = mongoose.model("SavingWithdraw",SavingSchema);