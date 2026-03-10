import pool from "../../config/db.js";

export default async function markPasswordResetUsed(id) {
  const result = await pool.query(
    `UPDATE password_resets
     SET used_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}
