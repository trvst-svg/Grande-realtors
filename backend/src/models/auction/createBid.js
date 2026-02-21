import pool from "../../config/db.js";

export default async function createBid({ auction_id, user_id, bid_amount }) {
  const result = await pool.query(
    `INSERT INTO bids (auction_id, user_id, bid_amount)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [auction_id, user_id, bid_amount]
  );
  return result.rows[0];
}
