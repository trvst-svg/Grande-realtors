import { Router } from "express";
import {
  createAuctionHandler,
  createBidHandler,
  getAuctionHandler,
  listAuctionsHandler,
  listBidsHandler,
  updateAuctionStatusHandler,
} from "../controllers/auction.controller.js";
import {
  getBidTicketStatus,
  initiateBidTicket,
} from "../controllers/payment.controller.js";
import { requireAnyRole, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listAuctionsHandler);
router.post("/", requireAuth, createAuctionHandler);
router.get("/:id", getAuctionHandler);
router.post("/:id/ticket", requireAuth, initiateBidTicket);
router.get("/:id/ticket", requireAuth, getBidTicketStatus);
router.post("/:id/bids", requireAuth, createBidHandler);
router.get("/:id/bids", listBidsHandler);
router.patch(
  "/:id/status",
  requireAnyRole(["admin", "agent"]),
  updateAuctionStatusHandler
);

export default router;
