const mongoose = require("mongoose");

const guarantorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobileNo: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  chequePhoto: {
    type: String,
    required: true,
  },

  // extraDocuments: [String],
  extraDocuments_0: {
    type:String,
    required:true
  },
  extraDocuments_1: {
    type:String,
    required:true
  },
  extraDocuments_2: {
    type:String,
    required:true
  },
  extraDocuments_3: {
    type:String,
    required:true
  },
});

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    referredBy: {
      crpName: {
        type: String,
        required: true,
      },
      crpMobile: {
        type: String,
        required: true,
      },
      crpId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CRP",
        required: true,
      },
    },
    photo: {
      type: String,
      required: true,
    },
    aadharNo: {
      type: String,
      required: true,
      unique: true,
    },
    panNo: {
      type: String,
      required: true,
      unique: true,
    },
    accNo: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    guarantor: guarantorSchema,
    status: {
      type: String,
      default: "active",
    },
    savingsBalance: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CRP",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
