import pool from "../../config/db.js";

export default async function upsertBidTicket({
  auctionId,
  userId,
  transactionUuid,
  amount,
  status,
  transactionCode = null,
}) {
  const result = await pool.query(
    `INSERT INTO bid_tickets (auction_id, user_id, transaction_uuid, amount, status, transaction_code)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (auction_id, user_id)
     DO UPDATE SET transaction_uuid = EXCLUDED.transaction_uuid,
                   amount = EXCLUDED.amount,
                   status = EXCLUDED.status,
                   transaction_code = EXCLUDED.transaction_code,
                   paid_at = NULL,
                   updated_at = NOW()
     RETURNING *`,
    [auctionId, userId, transactionUuid, amount, status, transactionCode]
  );
  return result.rows[0];
}
