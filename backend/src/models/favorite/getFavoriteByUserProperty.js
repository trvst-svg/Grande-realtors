import pool from "../../config/db.js";

export default async function getFavoriteByUserProperty(userId, propertyId) {
  const result = await pool.query(
    `SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2`,
    [userId, propertyId]
  );
  return result.rows[0] || null;
}
