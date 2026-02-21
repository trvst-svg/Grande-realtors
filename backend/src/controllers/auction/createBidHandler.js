import {
  createBid,
  getAuctionById,
  getHighestBid,
} from "../../models/auction.model.js";

export default async function createBidHandler(req, res, next) {
  try {
    const { user_id, bid_amount } = req.body;
    const auction = await getAuctionById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    if (auction.status !== "open") {
      return res.status(400).json({ error: "Auction is not open" });
    }
    if (!user_id || !bid_amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const highestBid = await getHighestBid(auction.id);
    const current = Number(highestBid || auction.starting_price);
    if (Number(bid_amount) <= current) {
      return res.status(400).json({ error: "Bid must be higher than current" });
    }

    const bid = await createBid({
      auction_id: auction.id,
      user_id,
      bid_amount,
    });

    res.status(201).json({ message: "Bid placed", bid });
  } catch (err) {
    next(err);
  }
}
