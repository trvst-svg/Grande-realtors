import jwt from "jsonwebtoken";
import { getRoleIdByName } from "../models/user.model.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authorization required" });
  }

  try {
    const secret =
      process.env.JWT_SECRET || process.env.SECRET_KEY || "dev-secret";
    const payload = jwt.verify(token, secret);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(roleName) {
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
