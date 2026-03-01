import pool from "../../config/db.js";

export default async function getPropertyWithVerification(id) {
  const result = await pool.query(
    `SELECT p.*, pt.name AS property_type, pvr.request_status
     FROM properties p
     JOIN property_types pt ON pt.id = p.property_type_id
     LEFT JOIN LATERAL (
       SELECT request_status
       FROM property_verification_requests
       WHERE property_id = p.id
       ORDER BY id DESC
       LIMIT 1
     ) pvr ON true
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}
