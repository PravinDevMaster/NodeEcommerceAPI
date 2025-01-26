const Role = require("../models/Role");
const jwtUtils = require("../util/jwtUtils");

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(403).json({ message: "Token required" });
  }

  try {
    const decoded = jwtUtils.verifyToken(token);
    req.user = decoded; // Store decoded token (userId and role)
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const checkRolePermission = (allowedRoles, permission) => {
  return async (req, res, next) => {
    const userRole = await Role.findOne({ uuid: req.user.role });

    if (!userRole || !allowedRoles.includes(userRole.name)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (
      !userRole.permissions.includes(permission) ||
      (["POST", "PUT", "DELETE"].includes(req.method) && permission === "read")
    ) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};

module.exports = { authenticateToken, checkRolePermission };
