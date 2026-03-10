import pool from "../../config/db.js";

export default async function updateUserPassword(userId, password) {
  const result = await pool.query(
    `UPDATE users
     SET password = $1,
         updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [password, userId]
  );
  return result.rows[0] || null;
}
