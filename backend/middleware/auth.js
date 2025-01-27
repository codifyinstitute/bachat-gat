const jwt = require("jsonwebtoken");

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded);

      // Validate the token payload
      if (!decoded.id || !decoded.role) {
        return res.status(400).json({ message: "Invalid token payload" });
      }

      // Attach user information to req.user
      req.user = {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name || "N/A",
        mobile: decoded.mobile || "N/A",
      };

      // Role-based access control
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
