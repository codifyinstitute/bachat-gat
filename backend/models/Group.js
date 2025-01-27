// models/Group.js
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
          enum: ["president", "secretary", "member"],
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
  },
  { timestamps: true }
);

// Middleware to validate group constraints
groupSchema.pre("save", async function (next) {
  // Check maximum members limit
  if (this.members.length > 10) {
    throw new Error("Group cannot have more than 10 members");
  }

  // Ensure there is exactly one president and one secretary
  const presidentCount = this.members.filter(
    (m) => m.role === "president"
  ).length;
  const secretaryCount = this.members.filter(
    (m) => m.role === "secretary"
  ).length;

  if (presidentCount !== 1 || secretaryCount !== 1) {
    throw new Error("Group must have exactly one president and one secretary");
  }

  next();
});

module.exports = mongoose.model("Group", groupSchema);
