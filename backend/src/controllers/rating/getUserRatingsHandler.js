import { getRatingSummaryForUser, listRatingsByUser } from "../../models/rating.model.js";

export default async function getUserRatingsHandler(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const roleType = String(req.query?.role_type || "").trim().toLowerCase();

    if (!userId || !["seller", "handler"].includes(roleType)) {
      return res.status(400).json({ error: "User and role type are required" });
    }

    const summary = await getRatingSummaryForUser(userId, roleType);
    const ratings = await listRatingsByUser(userId, roleType);

    return res.json({
      summary,
      ratings,
    });
  } catch (err) {
    return next(err);
  }
}
