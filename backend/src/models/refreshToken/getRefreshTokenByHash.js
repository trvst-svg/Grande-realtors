import pool from "../../config/db.js";

export default async function getRefreshTokenByHash(tokenHash) {
  const result = await pool.query(
    `SELECT *
     FROM refresh_tokens
     WHERE token_hash = $1
       AND revoked_at IS NULL
       AND expires_at > NOW()`,
    [tokenHash]
  );
  return result.rows[0] || null;
}
