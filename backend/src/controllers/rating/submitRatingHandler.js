import {
  createRating,
  getRatingByTransactionRole,
  getRatingSummaryForUser,
} from "../../models/rating.model.js";
import { getTransactionById } from "../../models/transaction.model.js";
import sanitizeReviewText from "../../utils/sanitizeReviewText.js";

export default async function submitRatingHandler(req, res, next) {
  try {
    const buyerId = req.user?.id;
    const transactionId = Number(req.body?.transaction_id);
    const roleType = String(req.body?.role_type || "").trim().toLowerCase();
    const stars = Number(req.body?.stars);
    const review = sanitizeReviewText(req.body?.review);

    if (!buyerId) {
      return res.status(401).json({ error: "Authorization required" });
    }
    if (!transactionId || !["seller", "handler"].includes(roleType) || !Number.isInteger(stars)) {
      return res.status(400).json({ error: "Transaction, role type, and stars are required" });
    }
    if (stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Stars must be between 1 and 5" });
    }

    const transaction = await getTransactionById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (transaction.buyer_id !== buyerId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const ratedUserId =
      roleType === "seller" ? transaction.seller_id : transaction.handler_id;
    if (!ratedUserId) {
      return res.status(400).json({ error: "No eligible user found for this rating" });
    }

    const existing = await getRatingByTransactionRole(transactionId, buyerId, roleType);
    if (existing) {
      return res.status(409).json({ error: "You already rated this transaction" });
    }

    const record = await createRating({
      buyer_id: buyerId,
      rated_user_id: ratedUserId,
      property_id: transaction.property_id,
      transaction_id: transactionId,
      role_type: roleType,
      stars,
      review,
    });

    const summary = await getRatingSummaryForUser(ratedUserId, roleType);
    return res.status(201).json({
      message: "Rating submitted.",
      rating: record,
      summary,
    });
  } catch (err) {
    return next(err);
  }
}
