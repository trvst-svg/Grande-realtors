import { Router } from "express";
import { getUserProfileHandler } from "../controllers/user.controller.js";

const router = Router();

router.get("/:id/profile", getUserProfileHandler);

export default router;
