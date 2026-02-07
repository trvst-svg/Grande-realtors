import { Router } from "express";
import {
  getAdminDashboard,
  getAgentDashboard,
  getUserDashboard,
} from "../controllers/dashboard.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/admin", requireAuth, requireRole("admin"), getAdminDashboard);
router.get("/agent/:id", requireAuth, getAgentDashboard);
router.get("/user/:id", requireAuth, getUserDashboard);

export default router;
