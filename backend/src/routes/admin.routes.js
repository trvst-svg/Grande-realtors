import { Router } from "express";
import {
  approveSignup,
  getSignupRequests,
  rejectSignup,
} from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/signup-requests", getSignupRequests);
router.post("/signup-requests/:id/approve", approveSignup);
router.post("/signup-requests/:id/reject", rejectSignup);

export default router;
