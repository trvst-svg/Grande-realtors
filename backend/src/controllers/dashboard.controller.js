import {
  getAdminDashboardStats,
  getAgentDashboardStats,
  getUserDashboardStats,
} from "../models/dashboard.model.js";
import { getRoleIdByName } from "../models/user.model.js";

export async function getAdminDashboard(_req, res, next) {
  try {
    const data = await getAdminDashboardStats();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getAgentDashboard(req, res, next) {
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

export async function getUserDashboard(req, res, next) {
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
