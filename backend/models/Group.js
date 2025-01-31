const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
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

      bankName : {
        type: String,
        required: true,
      }
    },
    members: [
      {
        member: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Member",
          required: true,
        },
        role: {
          type: String,
          enum: ["president", "vice-president", "member"], // Allow these roles
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CRP",
      required: true,
    },
    whatsappGroupLink: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
