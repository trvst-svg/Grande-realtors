import pool from "../../config/db.js";

export default async function rejectUser(userId, reason, reviewedBy = null) {
  const result = await pool.query(
    `UPDATE users
     SET approval_status = 'rejected',
         approval_reason = $2,
         rejected_at = NOW(),
         approved_at = NULL,
         reviewed_by = $3
     WHERE id = $1 AND approval_status = 'pending'
     RETURNING id, firstname, lastname, email, approval_status, approval_reason`,
    [userId, reason, reviewedBy]
  );
  return result.rows[0];
}
