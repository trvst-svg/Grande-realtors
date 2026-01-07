import { Router } from "express";
import {
  createAuctionHandler,
  createBidHandler,
  getAuctionHandler,
  listAuctionsHandler,
  listBidsHandler,
  updateAuctionStatusHandler,
} from "../controllers/auction.controller.js";

const router = Router();

router.get("/", listAuctionsHandler);
router.post("/", createAuctionHandler);
router.get("/:id", getAuctionHandler);
router.post("/:id/bids", createBidHandler);
router.get("/:id/bids", listBidsHandler);
router.patch("/:id/status", updateAuctionStatusHandler);

export default router;
