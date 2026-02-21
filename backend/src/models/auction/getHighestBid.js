import pool from "../../config/db.js";

export default async function getHighestBid(auction_id) {
  const result = await pool.query(
    `SELECT MAX(bid_amount) AS max_bid FROM bids WHERE auction_id = $1`,
    [auction_id]
  );
  return result.rows[0]?.max_bid || null;
}
