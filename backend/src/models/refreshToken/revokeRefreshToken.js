import pool from "../../config/db.js";

export default async function revokeRefreshToken(tokenId) {
  const result = await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [tokenId]
  );
  return result.rows[0] || null;
}
