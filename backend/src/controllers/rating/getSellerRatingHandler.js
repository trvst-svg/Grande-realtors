import { getSellerAverageRating } from "../../models/rating.model.js";

export default async function getSellerRatingHandler(req, res, next) {
  try {
    const sellerId = Number(req.params.sellerId);
    if (!sellerId) {
      return res.status(400).json({ error: "Seller id is required" });
    }
    const rating = await getSellerAverageRating(sellerId);
    return res.json({ rating });
  } catch (err) {
    return next(err);
  }
}
