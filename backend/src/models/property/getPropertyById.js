import pool from "../../config/db.js";

export default async function getPropertyById(id) {
  const result = await pool.query(
    `SELECT p.*, pt.name AS property_type
     FROM properties p
     JOIN property_types pt ON pt.id = p.property_type_id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0];
}
