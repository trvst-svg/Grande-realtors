import pool from "../../config/db.js";

export default async function rejectOtherBids(auctionId, winningBidId) {
  const result = await pool.query(
    `UPDATE bids
     SET status = 'rejected',
         responded_at = NOW(),
         is_winner = FALSE
     WHERE auction_id = $1
       AND id <> $2
       AND status <> 'rejected'
     RETURNING id, auction_id, user_id, bid_amount, bid_time, status, responded_at`,
    [auctionId, winningBidId]
  );
  return result.rows;
}
