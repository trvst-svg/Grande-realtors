import pool from "../../config/db.js";

export default async function rejectPropertyVerificationRequest(requestId) {
  const result = await pool.query(
    `UPDATE property_verification_requests
     SET request_status = 'rejected',
         verified_date = NOW()
     WHERE id = $1 AND request_status = 'pending'
     RETURNING *`,
    [requestId]
  );
  return result.rows[0];
}
