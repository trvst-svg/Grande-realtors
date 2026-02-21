import pool from "../../config/db.js";

export default async function approveUser(userId, reviewedBy = null) {
  const result = await pool.query(
    `UPDATE users
     SET approval_status = 'approved',
         approval_reason = NULL,
         approved_at = NOW(),
         rejected_at = NULL,
         reviewed_by = $2
     WHERE id = $1 AND approval_status = 'pending'
     RETURNING id, firstname, lastname, email, approval_status`,
    [userId, reviewedBy]
  );
  return result.rows[0];
}
