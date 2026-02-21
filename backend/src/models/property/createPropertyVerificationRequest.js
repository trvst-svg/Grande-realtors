import pool from "../../config/db.js";

export default async function createPropertyVerificationRequest(propertyId) {
  const result = await pool.query(
    `INSERT INTO property_verification_requests (property_id, request_status)
     SELECT $1, 'pending'
     WHERE NOT EXISTS (
       SELECT 1 FROM property_verification_requests WHERE property_id = $1
     )
     RETURNING *`,
    [propertyId]
  );
  return result.rows[0] || null;
}
