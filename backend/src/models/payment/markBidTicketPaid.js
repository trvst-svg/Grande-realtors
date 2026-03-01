import pool from "../../config/db.js";

export default async function markBidTicketPaid({
  transactionUuid,
  transactionCode,
  amount,
}) {
  const result = await pool.query(
    `UPDATE bid_tickets
     SET status = 'paid',
         transaction_code = $2,
         paid_at = NOW(),
         updated_at = NOW()
     WHERE transaction_uuid = $1
       AND amount = $3
     RETURNING *`,
    [transactionUuid, transactionCode, amount]
  );
  return result.rows[0] || null;
}
