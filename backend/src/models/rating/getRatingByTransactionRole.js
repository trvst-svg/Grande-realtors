import pool from "../../config/db.js";

export default async function getRatingByTransactionRole(transactionId, buyerId, roleType) {
  const result = await pool.query(
    `SELECT *
     FROM ratings
     WHERE transaction_id = $1
       AND buyer_id = $2
       AND role_type = $3`,
    [transactionId, buyerId, roleType]
  );
  return result.rows[0] || null;
}
