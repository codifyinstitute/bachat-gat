// const jwt = require("jsonwebtoken");

// const auth = (roles = []) => {
//   return async (req, res, next) => {
//     try {
//       const token = req.header("Authorization")?.replace("Bearer ", "");
//       console.log("Received token:", token);

//       if (!token) {
//         return res.status(401).json({ message: "Authentication required" });
//       }

//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log("Decoded token:", decoded);

//       // Validate token payload
//       if (!decoded.id || !decoded.name || !decoded.role) {
//         return res.status(400).json({ message: "Invalid token payload" });
//       }

//       req.user = {
//         id: decoded.id,
//         name: decoded.name,
//         role: decoded.role,
//       };

//       console.log("User:", req.user);

//       // Role-based access control
//       if (roles.length && !roles.includes(decoded.role)) {
//         return res.status(403).json({ message: "Unauthorized access" });
//       }

//       next();
//     } catch (error) {
//       console.error("Error validating token:", error.message);
//       res.status(401).json({ message: "Invalid token" });
//     }
//   };
// };

// module.exports = auth; // Make sure this line is here

const jwt = require("jsonwebtoken");

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Verify the token and decode it
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ensure the decoded token has required fields
      if (!decoded.id || !decoded.name || !decoded.role || !decoded.mobile) {
        return res.status(400).json({ message: "Invalid token payload" });
      }

      // Attach user information to req.user
      req.user = {
        id: decoded.id,
        name: decoded.name,
        role: decoded.role,
        mobile: decoded.mobile, // Ensure mobile is available in req.user
      };

      // Role-based access control (if any roles are specified)
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      next();
    } catch (error) {
      console.error("Error validating token:", error.message);
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = auth;
