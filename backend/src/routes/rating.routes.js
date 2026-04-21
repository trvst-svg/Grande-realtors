import { Router } from "express";
import {
  getUserRatingsHandler,
  moderateRatingHandler,
  getSellerRatingHandler,
  submitRatingHandler,
  submitSellerRatingHandler,
} from "../controllers/rating.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/seller/:sellerId", getSellerRatingHandler);
router.post("/seller", requireAuth, submitSellerRatingHandler);
router.get("/user/:userId", getUserRatingsHandler);
router.post("/", requireAuth, submitRatingHandler);
router.patch("/:id/moderate", requireAuth, requireRole("admin"), moderateRatingHandler);

export default router;
