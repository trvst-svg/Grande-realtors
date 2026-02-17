import { Router } from "express";
import { getUserProfileHandler } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:id/profile", requireAuth, getUserProfileHandler);

export default router;
