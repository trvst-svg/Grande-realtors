import pool from "../../config/db.js";

export default async function getBidById(bidId) {
  const result = await pool.query(
    `SELECT b.*, a.property_id
     FROM bids b
     JOIN auctions a ON a.id = b.auction_id
     WHERE b.id = $1`,
    [bidId]
  );
  return result.rows[0] || null;
}
