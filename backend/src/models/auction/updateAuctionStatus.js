import pool from "../../config/db.js";

export default async function updateAuctionStatus(id, status) {
  const result = await pool.query(
    `UPDATE auctions SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}
