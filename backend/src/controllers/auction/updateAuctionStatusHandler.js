import { updateAuctionStatus } from "../../models/auction.model.js";

export default async function updateAuctionStatusHandler(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const auction = await updateAuctionStatus(req.params.id, status);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.json({ message: "Auction updated", auction });
  } catch (err) {
    next(err);
  }
}
