const Member = require("../models/Member");

const memberController = {

  createMember: async (req, res) => {
    try {
      const {
        name,
        address,
        dateOfBirth,
        aadharNo,
        panNo,
        accNo,
        mobileNumber,
        guarantor,
      } = req.body;

      // Handle file uploads
      const photo = req.files.photo[0].path;
      const guarantorPhoto = req.files.guarantorPhoto[0].path;
      const guarantorCheque = req.files.guarantorCheque[0].path;

      // Handle extraDocuments specifically
      const extraDocuments_0 = req.files.extraDocuments_0 ? req.files.extraDocuments_0[0].path : null;
      const extraDocuments_1 = req.files.extraDocuments_1 ? req.files.extraDocuments_1[0].path : null;
      const extraDocuments_2 = req.files.extraDocuments_2 ? req.files.extraDocuments_2[0].path : null;
      const extraDocuments_3 = req.files.extraDocuments_3 ? req.files.extraDocuments_3[0].path : null;

      const referredBy = {
        crpName: req.user.name,
        crpMobile: req.user.mobile,
        crpId: req.user.id,
      };

      const member = new Member({
        name,
        address,
        dateOfBirth,
        photo,
        aadharNo,
        panNo,
        accNo,
        mobileNumber,
        isNPA,
        guarantor: {
          ...guarantor,
          photo: guarantorPhoto,
          chequePhoto: guarantorCheque,
          extraDocuments_0,
          extraDocuments_1,
          extraDocuments_2,
          extraDocuments_3,
        },
        referredBy,
        createdBy: req.user.id,
      });

      await member.save();
      res.status(201).json({
        message: "Member created successfully",
        member,
      });
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyValue.aadharNo) {
          return res.status(400).json({
            message: "Aadhar number already exists. Please provide a unique Aadhar number.",
          });
        }
        if (error.keyValue.panNo) {
          return res.status(400).json({
            message: "PAN number already exists. Please provide a unique PAN number.",
          });
        }
      }
      res.status(500).json({
        message: error.message,
      });
    }
  },

  updateMember: async (req, res) => {
    try {
      const updates = req.body;
      const memberId = req.params.id;

      // Handle file updates if provided
      if (req.files) {
        if (req.files.photo) {
          updates.photo = req.files.photo[0].path;
        }
        if (req.files.guarantorPhoto) {
          updates["guarantor.photo"] = req.files.guarantorPhoto[0].path;
        }
        if (req.files.guarantorCheque) {
          updates["guarantor.chequePhoto"] = req.files.guarantorCheque[0].path;
        }

        // Handle extraDocuments specifically
        if (req.files.extraDocuments_0) {
          updates["guarantor.extraDocuments_0"] = req.files.extraDocuments_0[0].path;
        }
        if (req.files.extraDocuments_1) {
          updates["guarantor.extraDocuments_1"] = req.files.extraDocuments_1[0].path;
        }
        if (req.files.extraDocuments_2) {
          updates["guarantor.extraDocuments_2"] = req.files.extraDocuments_2[0].path;
        }
        if (req.files.extraDocuments_3) {
          updates["guarantor.extraDocuments_3"] = req.files.extraDocuments_3[0].path;
        }
      }

      const member = await Member.findByIdAndUpdate(memberId, updates, {
        new: true,
        runValidators: true,
      });

      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      res.json({
        message: "Member updated successfully",
        member,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },

  // Get member by ID
  getMember: async (req, res) => {
    try {
      const member = await Member.findById(req.params.id);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },

  // Get all members
  getAllMembers: async (req, res) => {
    try {
      const members = await Member.find();
      res.json(members);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },

  // Delete member
  deleteMember: async (req, res) => {
    try {
      const member = await Member.findById(req.params.id);

      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      if (member.status === "inactive") {
        return res.status(400).json({ message: "This member is in a group and cannot be deleted" });
      }

      await member.deleteOne(); // Ensure deletion is awaited

      res.status(200).json({ message: "Member deleted successfully" });
    } catch (error) {
      console.error("Error deleting member:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

};

module.exports = memberController;
