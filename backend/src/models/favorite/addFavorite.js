import pool from "../../config/db.js";

export default async function addFavorite(userId, propertyId) {
  const result = await pool.query(
    `INSERT INTO favorites (user_id, property_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, property_id) DO NOTHING
     RETURNING *`,
    [userId, propertyId]
  );
  return result.rows[0] || null;
}
