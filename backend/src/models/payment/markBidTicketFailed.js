import pool from "../../config/db.js";

export default async function markBidTicketFailed(transactionUuid) {
  const result = await pool.query(
    `UPDATE bid_tickets
     SET status = 'failed',
         updated_at = NOW()
     WHERE transaction_uuid = $1
     RETURNING *`,
    [transactionUuid]
  );
  return result.rows[0] || null;
}
