import pool from "../../config/db.js";

export default async function getUserBidByAuction(auctionId, userId) {
  const result = await pool.query(
    `SELECT *
     FROM bids
     WHERE auction_id = $1 AND user_id = $2
     ORDER BY bid_amount DESC, bid_time DESC
     LIMIT 1`,
    [auctionId, userId]
  );
  return result.rows[0] || null;
}
