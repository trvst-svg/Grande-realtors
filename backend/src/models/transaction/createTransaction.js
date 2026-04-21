import pool from "../../config/db.js";

export default async function createTransaction({
  property_id,
  buyer_id,
  seller_id,
  handler_id,
  amount,
  payment_method,
}) {
  const result = await pool.query(
    `INSERT INTO transactions (property_id, buyer_id, seller_id, handler_id, amount, payment_method)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      property_id,
      buyer_id,
      seller_id,
      handler_id || null,
      amount,
      payment_method || "auction",
    ]
  );
  return result.rows[0];
}
