import pool from "../../config/db.js";

export default async function getHouseDetailsByPropertyId(propertyId) {
  const result = await pool.query(
    `SELECT * FROM houses WHERE property_id = $1`,
    [propertyId]
  );
  return result.rows[0] || null;
}
