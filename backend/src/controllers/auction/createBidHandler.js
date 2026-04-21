import {
  createBid,
  getAuctionById,
  getHighestBid,
  updateAuctionStatus,
} from "../../models/auction.model.js";
import { getBidTicketByUserAuction } from "../../models/payment.model.js";
import auctionEvents from "../../events/auctionEvents.js";

export default async function createBidHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    const { bid_amount } = req.body;
    const auction = await getAuctionById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    if (auction.owner_id === userId) {
      return res
        .status(403)
        .json({ error: "Owners cannot bid on their own property" });
    }
    const now = new Date();
    if (auction.start_time) {
      const startTime = new Date(auction.start_time);
      if (now < startTime) {
        return res.status(400).json({
          error: `Auction has not started yet. Starts at ${startTime.toISOString()}.`,
        });
      }
    }
    if (auction.end_time) {
      const endTime = new Date(auction.end_time);
      if (now > endTime) {
        await updateAuctionStatus(auction.id, "closed");
        return res.status(400).json({ error: "Auction has ended" });
      }
    }
    if (auction.status !== "open") {
      return res.status(400).json({ error: "Auction is not open" });
    }
    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!bid_amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ticket = await getBidTicketByUserAuction(auction.id, userId);
    if (!ticket || ticket.status !== "paid") {
      return res
        .status(403)
        .json({ error: "Bid ticket required before placing a bid" });
    }

    const highestBid = await getHighestBid(auction.id);
    const startingPrice = Number(auction.starting_price);
    const current = Number(highestBid || auction.starting_price);
    const bidValue = Number(bid_amount);
    if (!Number.isFinite(bidValue)) {
      return res.status(400).json({ error: "Bid amount must be a number" });
    }
    if (!Number.isFinite(startingPrice)) {
      return res.status(500).json({ error: "Auction starting price is invalid" });
    }

    if (highestBid == null) {
      if (bidValue <= startingPrice) {
        return res.status(400).json({
          error: `First bid must be higher than the asking price of ${startingPrice}.`,
        });
      }
    } else {
      const minBid = Math.ceil(current * 1.01);
      if (bidValue < minBid) {
        return res.status(400).json({
          error: `Bid must be at least 1% higher than the current highest bid. Minimum bid is ${minBid}.`,
        });
      }
    }

    const bid = await createBid({
      auction_id: auction.id,
      user_id: userId,
      bid_amount: bidValue,
    });

    auctionEvents.emit("bid:created", {
      auctionId: auction.id,
      bid: {
        id: bid.id,
        user_id: userId,
        bid_amount: bidValue,
        bid_time: bid.bid_time || new Date().toISOString(),
        status: bid.status || "pending",
      },
      current_price: bidValue,
    });

    res.status(201).json({ message: "Bid placed", bid });
  } catch (err) {
    next(err);
  }
}
