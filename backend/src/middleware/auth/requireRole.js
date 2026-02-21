import { getRoleIdByName } from "../../models/user.model.js";

export default function requireRole(roleName) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authorization required" });
    }

    try {
      const roleId = await getRoleIdByName(roleName);
      if (!roleId) {
        return res.status(500).json({ error: "Role not configured" });
      }

      if (req.user.role_id !== roleId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
