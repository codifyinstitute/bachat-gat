const Group = require("../models/Group");
const Member = require("../models/Member");

const groupController = {
  createGroup: async (req, res) => {
    try {
      const { name, address, members } = req.body;
      console.log("User :", req.user);
      // Ensure that the user creating the group is a CRP
      if (req.user.role !== "crp") {
        return res.status(403).json({
          message: "Only CRPs can create groups",
        });
      }

      // Validate member IDs and check if they're already in other groups
      for (const memberData of members) {
        const member = await Member.findById(memberData.member);
        if (!member) {
          return res.status(400).json({
            message: `Member ${memberData.member} not found`,
          });
        }

        // Check if member has guarantor details
        if (!member.guarantor) {
          return res.status(400).json({
            message: `Member ${member.name} doesn't have guarantor details`,
          });
        }

        // Check if member is already in another active group
        const existingGroup = await Group.findOne({
          "members.member": member._id,
          status: "active",
        });

        if (existingGroup) {
          return res.status(400).json({
            message: `Member ${member.name} is already part of group ${existingGroup.name}`,
          });
        }
      }

      // Ensure all roles are set to 'member' as per requirement
      const validatedMembers = members.map((m) => ({
        ...m,
        role: "member", // Only 'member' role for users
      }));

      const group = new Group({
        name,
        address,
        referredBy: {
          crpName: req.user.name,
          crpMobile: req.user.mobile,
          crpId: req.user.id,
        },
        members: validatedMembers,
        createdBy: req.user.id,
      });

      await group.save();

      // Populate member details in response
      await group.populate("members.member", "name mobileNumber");

      res.status(201).json({
        message: "Group created successfully",
        group,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Add member to group
  // addMember: async (req, res) => {
  //   try {
  //     const { groupId } = req.params;
  //     const { memberId, role } = req.body;

  //     const group = await Group.findById(groupId);
  //     if (!group) {
  //       return res.status(404).json({ message: "Group not found" });
  //     }

  //     // Check if member exists and has guarantor
  //     const member = await Member.findById(memberId);
  //     if (!member) {
  //       return res.status(404).json({ message: "Member not found" });
  //     }

  //     if (!member.guarantor) {
  //       return res.status(400).json({
  //         message: "Member must have guarantor details before joining a group",
  //       });
  //     }

  //     // Check if member is already in the group
  //     if (group.members.some((m) => m.member.toString() === memberId)) {
  //       return res.status(400).json({
  //         message: "Member is already in this group",
  //       });
  //     }

  //     // Add member to group
  //     group.members.push({
  //       member: memberId,
  //       role,
  //     });

  //     // Change member status to "inactive" using findByIdAndUpdate
  //     await Member.findByIdAndUpdate(memberId, { status: "inactive" });

  //     await group.save();
  //     await group.populate("members.member", "name mobileNumber");

  //     res.json({
  //       message: "Member added successfully, status set to inactive",
  //       group,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // },

  addMember: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { memberId, role } = req.body;

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const member = await Member.findById(memberId);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      if (!member.guarantor) {
        return res.status(400).json({
          message: "Member must have guarantor details before joining a group",
        });
      }

      // Ensure member is not already in the group
      if (group.members.some((m) => m.member.toString() === memberId)) {
        return res.status(400).json({
          message: "Member is already in this group",
        });
      }

      // Count existing roles in the group
      const presidentCount = group.members.filter(
        (m) => m.role === "president"
      ).length;
      const vicePresidentCount = group.members.filter(
        (m) => m.role === "vice-president"
      ).length;
      const memberCount = group.members.filter(
        (m) => m.role === "member"
      ).length;

      // Validate role addition
      if (role === "president" && presidentCount >= 1) {
        return res
          .status(400)
          .json({ message: "Only one President is allowed." });
      }
      if (role === "vice-president" && vicePresidentCount >= 1) {
        return res
          .status(400)
          .json({ message: "Only one Vice-President is allowed." });
      }
      if (role === "member" && memberCount >= 8) {
        return res.status(400).json({
          message:
            "Maximum of 8 members (excluding President & Vice-President) allowed.",
        });
      }

      // Add member to the group
      group.members.push({
        member: memberId,
        role,
      });

      // Set the member's status to "inactive" globally
      await Member.findByIdAndUpdate(memberId, { status: "inactive" });

      await group.save();
      await group.populate("members.member", "name mobileNumber");

      res.json({
        message: "Member added successfully, status set to inactive",
        group,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update group
  updateGroup: async (req, res) => {
    try {
      const updates = req.body;
      const groupId = req.params.id;

      const group = await Group.findByIdAndUpdate(groupId, updates, {
        new: true,
        runValidators: true,
      }).populate("members.member", "name mobileNumber");

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      res.json({
        message: "Group updated successfully",
        group,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get group by ID
  getGroup: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id)
        .populate("members.member", "name mobileNumber")
        .populate("createdBy", "name");

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      res.json(group);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getGroupsCreatedByCrp: async (req, res) => {
    try {
      // Ensure that the user is a CRP
      if (req.user.role !== "crp") {
        return res.status(403).json({
          message: "Only CRPs can access their created groups",
        });
      }

      // Find groups created by the logged-in CRP
      const groups = await Group.find({ createdBy: req.user.id })
        .populate("members.member", "name mobileNumber")
        .populate("createdBy", "name");

      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all groups
  // getAllGroups: async (req, res) => {
  //   try {
  //     const groups = await Group.find({ createdBy: req.user.id })
  //       .populate("members.member", "name mobileNumber")
  //       .populate("createdBy", "name");
  //     console.log("reqID :", req.user.id);
  //     res.json(groups);
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // },
  getAllGroups: async (req, res) => {
    try {
      // If the user is an admin, get all groups without filtering by createdBy
      const groups = await Group.find()
        .populate("members.member", "name mobileNumber")
        .populate("createdBy", "name");

      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Remove member from group
  // removeMember: async (req, res) => {
  //   try {
  //     const { groupId, memberId } = req.params;

  //     const group = await Group.findById(groupId);
  //     if (!group) {
  //       return res.status(404).json({ message: "Group not found" });
  //     }

  //     // Check if member exists in group
  //     const memberIndex = group.members.findIndex(
  //       (m) => m.member.toString() === memberId
  //     );

  //     if (memberIndex === -1) {
  //       return res.status(404).json({ message: "Member not found in group" });
  //     }

  //     // Remove member
  //     group.members.splice(memberIndex, 1);
  //     await group.save();
  //     await group.populate("members.member", "name mobileNumber");

  //     res.json({
  //       message: "Member removed successfully",
  //       group,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // },

  removeMember: async (req, res) => {
    try {
      const { groupId, memberId } = req.params;

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // Check if member exists in the group
      const memberIndex = group.members.findIndex(
        (m) => m.member.toString() === memberId
      );

      if (memberIndex === -1) {
        return res.status(404).json({ message: "Member not found in group" });
      }

      // Remove member from the group
      group.members.splice(memberIndex, 1);
      await group.save();

      // Optionally, update member's status to "active" when removed from the group
      await Member.findByIdAndUpdate(memberId, { status: "active" });

      res.json({
        message: "Member removed successfully",
        group,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Deactivate group
  deactivateGroup: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id);

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      group.status = "inactive";
      await group.save();

      res.json({ message: "Group deactivated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = groupController;
