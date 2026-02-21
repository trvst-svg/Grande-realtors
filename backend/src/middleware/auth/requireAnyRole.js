import { getRoleIdByName } from "../../models/user.model.js";

export default function requireAnyRole(roleNames = []) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!Array.isArray(roleNames) || roleNames.length === 0) {
      return res.status(500).json({ error: "Roles not configured" });
    }

    try {
      const roleIds = await Promise.all(
        roleNames.map((name) => getRoleIdByName(name))
      );
      if (roleIds.some((id) => !id)) {
        return res.status(500).json({ error: "Roles not configured" });
      }

      if (!roleIds.includes(req.user.role_id)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
