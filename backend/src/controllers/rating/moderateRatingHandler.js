import { moderateRating } from "../../models/rating.model.js";

export default async function moderateRatingHandler(req, res, next) {
  try {
    const ratingId = Number(req.params.id);
    const hidden = Boolean(req.body?.hidden);
    const moderationReason = String(req.body?.reason || "").trim();

    if (!ratingId) {
      return res.status(400).json({ error: "Rating id is required" });
    }

    const updated = await moderateRating({
      ratingId,
      hidden,
      moderatedBy: req.user?.id,
      moderationReason,
    });

    if (!updated) {
      return res.status(404).json({ error: "Rating not found" });
    }

    return res.json({ message: "Rating moderated.", rating: updated });
  } catch (err) {
    return next(err);
  }
}
