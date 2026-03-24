import { Router } from "express";
import { getContractHandler } from "../controllers/contract.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/:bidId", getContractHandler);

export default router;
