import pool from "../../config/db.js";

export default async function listPendingUsers() {
  const result = await pool.query(
    `SELECT u.id, u.firstname, u.lastname, u.email, u.number, u.created_at,
            u.citizenship_front, u.citizenship_back, u.approval_status,
            r.name AS role_name
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE u.approval_status = 'pending'
     ORDER BY u.created_at ASC`
  );
  return result.rows;
}
