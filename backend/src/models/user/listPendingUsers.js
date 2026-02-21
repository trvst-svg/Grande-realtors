import pool from "../../config/db.js";

export default async function listPendingUsers() {
  const result = await pool.query(
    `SELECT id, firstname, lastname, email, number, created_at,
            citizenship_front, citizenship_back, approval_status
     FROM users
     WHERE approval_status = 'pending'
     ORDER BY created_at ASC`
  );
  return result.rows;
}
