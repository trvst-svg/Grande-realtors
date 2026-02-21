import pool from "../../config/db.js";

export default async function createProperty({
  owner_id,
  property_type_id,
  location,
  description,
  price,
  listing_purpose,
  listing_type,
  sale_status,
}) {
  const result = await pool.query(
    `INSERT INTO properties
      (owner_id, property_type_id, location, description, price, listing_purpose, listing_type, sale_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      owner_id,
      property_type_id,
      location,
      description,
      price,
      listing_purpose,
      listing_type,
      sale_status,
    ]
  );
  return result.rows[0];
}
