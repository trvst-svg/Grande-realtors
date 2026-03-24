import pool from "../../config/db.js";

export default async function getSellerAverageRating(sellerId) {
  const result = await pool.query(
    `SELECT COALESCE(AVG(rating), 0)::numeric(4,2) AS avg_rating,
            COUNT(*)::int AS rating_count
     FROM seller_ratings
     WHERE seller_id = $1`,
    [sellerId]
  );
  return result.rows[0] || { avg_rating: 0, rating_count: 0 };
}
