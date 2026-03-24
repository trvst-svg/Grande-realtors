import { Router } from "express";
import { handleKhaltiReturn } from "../controllers/payment.controller.js";

const router = Router();

router.get("/khalti/return", handleKhaltiReturn);

export default router;
