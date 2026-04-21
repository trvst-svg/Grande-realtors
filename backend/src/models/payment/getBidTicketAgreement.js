import pool from "../../config/db.js";

export default async function getBidTicketAgreement(auctionId, userId) {
  const result = await pool.query(
    `SELECT *
     FROM bid_ticket_agreements
     WHERE auction_id = $1 AND user_id = $2`,
    [auctionId, userId]
  );
  return result.rows[0] || null;
}
