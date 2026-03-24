import pool from "../../config/db.js";

export default async function createSellerRating({
  seller_id,
  transaction_id,
  rated_by,
  rating,
  review,
}) {
  const result = await pool.query(
    `INSERT INTO seller_ratings (seller_id, transaction_id, rated_by, rating, review)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [seller_id, transaction_id, rated_by, rating, review || null]
  );
  return result.rows[0];
}
