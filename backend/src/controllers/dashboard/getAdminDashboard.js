import { getAdminDashboardStats } from "../../models/dashboard.model.js";

export default async function getAdminDashboard(_req, res, next) {
  try {
    const data = await getAdminDashboardStats();
    res.json(data);
  } catch (err) {
    next(err);
  }
}
