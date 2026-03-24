import pool from "../../config/db.js";

export default async function getTransactionById(transactionId) {
  const result = await pool.query(
    `SELECT * FROM transactions WHERE id = $1`,
    [transactionId]
  );
  return result.rows[0] || null;
}
