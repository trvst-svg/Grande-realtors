import pool from "../../config/db.js";

export default async function createRating({
  buyer_id,
  rated_user_id,
  property_id,
  transaction_id,
  role_type,
  stars,
  review,
}) {
  const result = await pool.query(
    `INSERT INTO ratings (
        buyer_id,
        rated_user_id,
        property_id,
        transaction_id,
        role_type,
        stars,
        review
      )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [buyer_id, rated_user_id, property_id, transaction_id, role_type, stars, review || null]
  );
  return result.rows[0] || null;
}
