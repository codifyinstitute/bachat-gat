const Member = require("../models/Member");

const memberController = {
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

  //     console.log(req.user);

  //     // Handle file uploads
  //     const photo = req.files.photo[0].path;
  //     const guarantorPhoto = req.files.guarantorPhoto[0].path;
  //     const guarantorCheque = req.files.guarantorCheque[0].path;

  //     let extraDocuments = [];
  //     if (req.files.extraDocuments) {
  //       extraDocuments = req.files.extraDocuments.map((file) => file.path);
  //     }

  //     // Ensure the `referredBy` and `createdBy` fields are populated from `req.user`
  //     const referredBy = {
  //       crpName: req.user.name,
  //       crpMobile: req.user.mobile,
  //       crpId: req.user.id,
  //     };

  //     const member = new Member({
  //       name,
  //       address,
  //       dateOfBirth,
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
  //       referredBy, // Attach referredBy object
  //       createdBy: req.user.id, // Attach createdBy field
  //     });

  //     await member.save();

  //     res.status(201).json({
  //       message: "Member created successfully",
  //       member,
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       message: error.message,
  //     });
  //   }
  // },

  // Update member

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
      if (error.code === 11000) {
        // Handle duplicate error for unique fields (AadharNo or PanNo)
        if (error.keyValue.aadharNo) {
          return res.status(400).json({
            message:
              "Aadhar number already exists. Please provide a unique Aadhar number.",
          });
        }
        if (error.keyValue.panNo) {
          return res.status(400).json({
            message:
              "PAN number already exists. Please provide a unique PAN number.",
          });
        }
      }
      // General error handling
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
