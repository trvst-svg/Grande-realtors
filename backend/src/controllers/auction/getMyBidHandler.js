import { getAuctionById, getUserBidByAuction } from "../../models/auction.model.js";

export default async function getMyBidHandler(req, res, next) {
  try {
    const auctionId = Number(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!auctionId) {
      return res.status(400).json({ error: "Auction id is required" });
    }

    const auction = await getAuctionById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    const bid = await getUserBidByAuction(auctionId, userId);
    return res.json({ bid });
  } catch (err) {
    return next(err);
  }
}
