import { listAuctions } from "../../models/auction.model.js";

export default async function listAuctionsHandler(_req, res, next) {
  try {
    const items = await listAuctions();
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
