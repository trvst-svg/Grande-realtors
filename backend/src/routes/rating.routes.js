import { Router } from "express";
import {
  getSellerRatingHandler,
  submitSellerRatingHandler,
} from "../controllers/rating.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/seller/:sellerId", getSellerRatingHandler);
router.post("/seller", requireAuth, submitSellerRatingHandler);

export default router;
