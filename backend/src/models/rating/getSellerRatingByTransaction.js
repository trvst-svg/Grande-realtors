import pool from "../../config/db.js";

export default async function getSellerRatingByTransaction(transactionId, ratedBy) {
  const result = await pool.query(
    `SELECT *
     FROM seller_ratings
     WHERE transaction_id = $1 AND rated_by = $2`,
    [transactionId, ratedBy]
  );
  return result.rows[0] || null;
}
