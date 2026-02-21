import { Router } from "express";
import {
  approveSignup,
  getSignupRequests,
  getPropertyRequests,
  approvePropertyRequest,
  rejectPropertyRequest,
  rejectSignup,
} from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/signup-requests", getSignupRequests);
router.post("/signup-requests/:id/approve", approveSignup);
router.post("/signup-requests/:id/reject", rejectSignup);
router.get("/property-requests", getPropertyRequests);
router.post("/property-requests/:id/approve", approvePropertyRequest);
router.post("/property-requests/:id/reject", rejectPropertyRequest);

export default router;
