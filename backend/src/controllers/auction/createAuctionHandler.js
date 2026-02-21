import { createAuction } from "../../models/auction.model.js";

export default async function createAuctionHandler(req, res, next) {
  try {
    const { property_id, start_time, end_time, starting_price, status } =
      req.body;

    if (!property_id || !starting_price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const auction = await createAuction({
      property_id,
      start_time,
      end_time,
      starting_price,
      status,
    });

    res.status(201).json({ message: "Auction created", auction });
  } catch (err) {
    next(err);
  }
}
