import { getAuctionById } from "../../models/auction.model.js";

export default async function getAuctionHandler(req, res, next) {
  try {
    const auction = await getAuctionById(req.params.id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.json(auction);
  } catch (err) {
    next(err);
  }
}
