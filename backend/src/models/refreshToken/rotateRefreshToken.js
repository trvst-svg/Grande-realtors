import pool from "../../config/db.js";

export default async function rotateRefreshToken(tokenId, tokenHash, expiresAt) {
  const result = await pool.query(
    `UPDATE refresh_tokens
     SET token_hash = $2,
         expires_at = $3,
         created_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [tokenId, tokenHash, expiresAt]
  );
  return result.rows[0] || null;
}
