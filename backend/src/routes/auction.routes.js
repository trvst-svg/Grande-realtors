import { Router } from "express";
import {
  createAuctionHandler,
  createBidHandler,
  getAuctionHandler,
  listAuctionsHandler,
  listBidsHandler,
  streamAuctionHandler,
  getMyBidHandler,
  updateBidStatusHandler,
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
router.get("/:id/stream", streamAuctionHandler);
router.get("/:id/my-bid", requireAuth, getMyBidHandler);
router.post("/:id/ticket", requireAuth, initiateBidTicket);
router.get("/:id/ticket", requireAuth, getBidTicketStatus);
router.post("/:id/bids", requireAuth, createBidHandler);
router.get("/:id/bids", requireAuth, listBidsHandler);
router.patch("/:id/bids/:bidId", requireAuth, updateBidStatusHandler);
router.patch(
  "/:id/status",
  requireAnyRole(["admin", "agent"]),
  updateAuctionStatusHandler
);

export default router;
