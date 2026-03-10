import pool from "../../config/db.js";

export default async function removeFavorite(userId, propertyId) {
  const result = await pool.query(
    `DELETE FROM favorites WHERE user_id = $1 AND property_id = $2`,
    [userId, propertyId]
  );
  return result.rowCount > 0;
}
