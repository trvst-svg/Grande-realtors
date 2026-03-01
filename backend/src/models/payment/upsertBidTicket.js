import pool from "../../config/db.js";

export default async function upsertBidTicket({
  auctionId,
  userId,
  transactionUuid,
  amount,
  status,
}) {
  const result = await pool.query(
    `INSERT INTO bid_tickets (auction_id, user_id, transaction_uuid, amount, status)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (auction_id, user_id)
     DO UPDATE SET transaction_uuid = EXCLUDED.transaction_uuid,
                   amount = EXCLUDED.amount,
                   status = EXCLUDED.status,
                   transaction_code = NULL,
                   paid_at = NULL,
                   updated_at = NOW()
     RETURNING *`,
    [auctionId, userId, transactionUuid, amount, status]
  );
  return result.rows[0];
}
