import pool from "../../config/db.js";

export default async function moderateRating({
  ratingId,
  hidden,
  moderatedBy,
  moderationReason,
}) {
  const result = await pool.query(
    `UPDATE ratings
     SET is_hidden = $2,
         moderated_by = $3,
         moderated_at = NOW(),
         moderation_reason = $4,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [ratingId, hidden, moderatedBy, moderationReason || null]
  );
  return result.rows[0] || null;
}
