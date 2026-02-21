import pool from "../../config/db.js";

export default async function approvePropertyVerificationRequest(requestId) {
  const result = await pool.query(
    `UPDATE property_verification_requests
     SET request_status = 'approved',
         verified_date = NOW()
     WHERE id = $1 AND request_status = 'pending'
     RETURNING *`,
    [requestId]
  );
  return result.rows[0];
}
