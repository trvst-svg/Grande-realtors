import {
  createBid,
  getAuctionById,
  getHighestBid,
} from "../../models/auction.model.js";
import { getBidTicketByUserAuction } from "../../models/payment.model.js";

export default async function createBidHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    const { bid_amount } = req.body;
    const auction = await getAuctionById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
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
    const current = Number(highestBid || auction.starting_price);
    const bidValue = Number(bid_amount);
    if (!Number.isFinite(bidValue)) {
      return res.status(400).json({ error: "Bid amount must be a number" });
    }
    if (bidValue <= current) {
      return res.status(400).json({
        error: `Bid must be higher than current. Minimum bid is ${current + 1}.`,
      });
    }

    const bid = await createBid({
      auction_id: auction.id,
      user_id: userId,
      bid_amount: bidValue,
    });

    res.status(201).json({ message: "Bid placed", bid });
  } catch (err) {
    next(err);
  }
}
