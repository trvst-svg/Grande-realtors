import { Router } from "express";
import {
  getAdminDashboard,
  getAgentDashboard,
  getUserDashboard,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/admin", getAdminDashboard);
router.get("/agent/:id", getAgentDashboard);
router.get("/user/:id", getUserDashboard);

export default router;
