import pool from "../../config/db.js";

export default async function createPasswordReset({ userId, tokenHash, expiresAt }) {
  const result = await pool.query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
}
