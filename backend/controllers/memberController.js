const Member = require("../models/Member");

const memberController = {
  // Create new member
  // createMember: async (req, res) => {
  //   try {
  //     const {
  //       name,
  //       address,
  //       dateOfBirth,
  //       aadharNo,
  //       panNo,
  //       mobileNumber,
  //       guarantor,
  //     } = req.body;

  //     // Handle file uploads
  //     let photo = "";
  //     let guarantorPhoto = "";
  //     let guarantorCheque = "";
  //     let extraDocuments = [];

  //     if (req.files) {
  //       // Check if files are provided and set them
  //       if (req.files.photo) {
  //         photo = req.files.photo[0].path;
  //       }
  //       if (req.files.guarantorPhoto) {
  //         guarantorPhoto = req.files.guarantorPhoto[0].path;
  //       }
  //       if (req.files.guarantorCheque) {
  //         guarantorCheque = req.files.guarantorCheque[0].path;
  //       }
  //       if (req.files.extraDocuments) {
  //         extraDocuments = req.files.extraDocuments.map((file) => file.path);
  //       }
  //     }

  //     // Ensure req.user has necessary data from JWT
  //     const referredBy = {
  //       crpName: req.user.name,
  //       crpMobile: req.user.mobile,
  //       crpId: req.user.id,
  //     };

  //     // Create new member
  //     const member = new Member({
  //       name,
  //       address,
  //       dateOfBirth,
  //       referredBy,
  //       photo,
  //       aadharNo,
  //       panNo,
  //       mobileNumber,
  //       guarantor: {
  //         ...guarantor,
  //         photo: guarantorPhoto,
  //         chequePhoto: guarantorCheque,
  //         extraDocuments,
  //       },
  //       createdBy: req.user.id,
  //     });

  //     await member.save();
  //     res.status(201).json({
  //       message: "Member created successfully",
  //       member,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: error.message });
  //   }
  // },
  createMember: async (req, res) => {
    try {
      const {
        name,
        address,
        dateOfBirth,
        aadharNo,
        panNo,
        mobileNumber,
        guarantor,
      } = req.body;

      console.log(req.user);

      // Handle file uploads
      const photo = req.files.photo[0].path;
      const guarantorPhoto = req.files.guarantorPhoto[0].path;
      const guarantorCheque = req.files.guarantorCheque[0].path;

      let extraDocuments = [];
      if (req.files.extraDocuments) {
        extraDocuments = req.files.extraDocuments.map((file) => file.path);
      }

      // Ensure the `referredBy` and `createdBy` fields are populated from `req.user`
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
        mobileNumber,
        guarantor: {
          ...guarantor,
          photo: guarantorPhoto,
          chequePhoto: guarantorCheque,
          extraDocuments,
        },
        referredBy, // Attach referredBy object
        createdBy: req.user.id, // Attach createdBy field
      });

      await member.save();

      res.status(201).json({
        message: "Member created successfully",
        member,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },

  // Update member
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
        if (req.files.extraDocuments) {
          updates["guarantor.extraDocuments"] = req.files.extraDocuments.map(
            (file) => file.path
          );
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
      const members = await Member.find({ createdBy: req.user.id });
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

      // Mark member as inactive
      member.status = "inactive";
      await member.save();

      res.json({ message: "Member deactivated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = memberController;
