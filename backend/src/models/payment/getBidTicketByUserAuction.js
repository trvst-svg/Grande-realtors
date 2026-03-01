import pool from "../../config/db.js";

export default async function getBidTicketByUserAuction(auctionId, userId) {
  const result = await pool.query(
    `SELECT *
     FROM bid_tickets
     WHERE auction_id = $1 AND user_id = $2`,
    [auctionId, userId]
  );
  return result.rows[0] || null;
}
