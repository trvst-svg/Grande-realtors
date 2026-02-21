import pool from "../../config/db.js";

export default async function getPropertyImages(property_id) {
  const result = await pool.query(
    `SELECT image_url FROM property_images WHERE property_id = $1`,
    [property_id]
  );
  return result.rows.map((row) => row.image_url);
}
