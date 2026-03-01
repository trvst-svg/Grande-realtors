import pool from "../../config/db.js";

export default async function getBidTicketByTransaction(transactionUuid) {
  const result = await pool.query(
    `SELECT *
     FROM bid_tickets
     WHERE transaction_uuid = $1`,
    [transactionUuid]
  );
  return result.rows[0] || null;
}
