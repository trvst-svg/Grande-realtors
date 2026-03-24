import pool from "../../config/db.js";

export default async function updateBidStatus(bidId, status) {
  const result = await pool.query(
    `UPDATE bids
     SET status = $2,
         responded_at = NOW(),
         is_winner = CASE WHEN $2 = 'accepted' THEN TRUE ELSE FALSE END
     WHERE id = $1
     RETURNING *`,
    [bidId, status]
  );
  return result.rows[0] || null;
}
