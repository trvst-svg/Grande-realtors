import pool from "../../config/db.js";

export default async function getPasswordResetByTokenHash(tokenHash) {
  const result = await pool.query(
    `SELECT *
     FROM password_resets
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [tokenHash]
  );
  return result.rows[0] || null;
}
