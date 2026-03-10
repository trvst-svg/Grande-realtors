import pool from "../../config/db.js";

export default async function getLandDetailsByPropertyId(propertyId) {
  const result = await pool.query(
    `SELECT * FROM lands WHERE property_id = $1`,
    [propertyId]
  );
  return result.rows[0] || null;
}
