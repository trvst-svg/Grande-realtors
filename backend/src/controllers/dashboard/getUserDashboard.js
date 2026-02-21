import { getUserDashboardStats } from "../../models/dashboard.model.js";
import { getRoleIdByName } from "../../models/user.model.js";

export default async function getUserDashboard(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({ error: "User id is required" });
    }
    const adminRoleId = await getRoleIdByName("admin");
    if (!adminRoleId) {
      return res.status(500).json({ error: "Roles not configured" });
    }
    if (req.user.role_id !== adminRoleId && req.user.id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const data = await getUserDashboardStats(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
