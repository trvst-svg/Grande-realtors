import { getAgentDashboardStats } from "../../models/dashboard.model.js";
import { getRoleIdByName } from "../../models/user.model.js";

export default async function getAgentDashboard(req, res, next) {
  try {
    const agentId = Number(req.params.id);
    if (!agentId) {
      return res.status(400).json({ error: "Agent id is required" });
    }
    const adminRoleId = await getRoleIdByName("admin");
    const agentRoleId = await getRoleIdByName("agent");
    if (!adminRoleId || !agentRoleId) {
      return res.status(500).json({ error: "Roles not configured" });
    }

    if (req.user.role_id !== adminRoleId) {
      if (req.user.role_id !== agentRoleId || req.user.id !== agentId) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    const data = await getAgentDashboardStats(agentId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
