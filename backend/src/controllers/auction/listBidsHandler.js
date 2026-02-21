import { listBidsByAuction } from "../../models/auction.model.js";

export default async function listBidsHandler(req, res, next) {
  try {
    const items = await listBidsByAuction(req.params.id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
