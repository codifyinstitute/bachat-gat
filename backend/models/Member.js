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
    String,
  },
  extraDocuments_1: {
    String,
  },
  extraDocuments_2: {
    String,
  },
  extraDocuments_3: {
    String,
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
    mobileNumber: {
      type: String,
      required: true,
    },
    guarantor: guarantorSchema,
    status: {
      type: String,
      enum: ["active", "inactive"],
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
