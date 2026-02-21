import { Router } from "express";
import {
  approveSignup,
  getSignupRequests,
  getPropertyRequests,
  approvePropertyRequest,
  rejectPropertyRequest,
  rejectSignup,
} from "../controllers/admin.controller.js";
import { requireAnyRole, requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/signup-requests", requireRole("admin"), getSignupRequests);
router.post("/signup-requests/:id/approve", requireRole("admin"), approveSignup);
router.post("/signup-requests/:id/reject", requireRole("admin"), rejectSignup);
router.get(
  "/property-requests",
  requireAnyRole(["admin", "agent"]),
  getPropertyRequests
);
router.post(
  "/property-requests/:id/approve",
  requireAnyRole(["admin", "agent"]),
  approvePropertyRequest
);
router.post(
  "/property-requests/:id/reject",
  requireAnyRole(["admin", "agent"]),
  rejectPropertyRequest
);

export default router;
