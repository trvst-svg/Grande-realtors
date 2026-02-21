import pool from "../../config/db.js";

export default async function listBidsByAuction(auction_id) {
  const result = await pool.query(
    `SELECT b.*, u.firstname, u.lastname
     FROM bids b
     JOIN users u ON u.id = b.user_id
     WHERE b.auction_id = $1
     ORDER BY b.bid_amount DESC, b.bid_time DESC`,
    [auction_id]
  );
  return result.rows;
}
