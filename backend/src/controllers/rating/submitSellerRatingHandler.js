import { createSellerRating, getSellerRatingByTransaction } from "../../models/rating.model.js";
import { getTransactionById } from "../../models/transaction.model.js";

export default async function submitSellerRatingHandler(req, res, next) {
  try {
    const userId = req.user?.id;
    const transactionId = Number(req.body?.transaction_id);
    const rating = Number(req.body?.rating);
    const review = req.body?.review?.trim();

    if (!userId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!transactionId || !Number.isFinite(rating)) {
      return res
        .status(400)
        .json({ error: "Transaction and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const transaction = await getTransactionById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (transaction.buyer_id !== userId) {
      return res.status(403).json({ error: "Only the buyer can rate the seller" });
    }

    const existing = await getSellerRatingByTransaction(transactionId, userId);
    if (existing) {
      return res.status(409).json({ error: "Rating already submitted" });
    }

    const record = await createSellerRating({
      seller_id: transaction.seller_id,
      transaction_id: transactionId,
      rated_by: userId,
      rating,
      review,
    });

    return res.status(201).json({ message: "Rating submitted", rating: record });
  } catch (err) {
    return next(err);
  }
}
