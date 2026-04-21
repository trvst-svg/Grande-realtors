import pool from "../../config/db.js";

export default async function createContract({
  bid_id,
  property_id,
  buyer_id,
  seller_id,
  transaction_id,
  contract_text,
}) {
  const result = await pool.query(
    `INSERT INTO contracts (bid_id, property_id, buyer_id, seller_id, transaction_id, contract_text)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [bid_id || null, property_id, buyer_id, seller_id, transaction_id || null, contract_text]
  );
  return result.rows[0];
}
