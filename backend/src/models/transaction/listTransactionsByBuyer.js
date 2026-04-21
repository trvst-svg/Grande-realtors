import pool from "../../config/db.js";

export default async function listTransactionsByBuyer(buyerId) {
  const result = await pool.query(
    `SELECT t.id AS transaction_id,
            t.property_id,
            t.amount,
            t.payment_method,
            t.transaction_date,
            p.location,
            pt.name AS property_type,
            seller.id AS seller_id,
            seller.firstname AS seller_firstname,
            seller.lastname AS seller_lastname,
            handler.id AS handler_id,
            handler.firstname AS handler_firstname,
            handler.lastname AS handler_lastname,
            EXISTS(
              SELECT 1
              FROM ratings r
              WHERE r.transaction_id = t.id
                AND r.buyer_id = t.buyer_id
                AND r.role_type = 'seller'
            ) AS seller_rated,
            EXISTS(
              SELECT 1
              FROM ratings r
              WHERE r.transaction_id = t.id
                AND r.buyer_id = t.buyer_id
                AND r.role_type = 'handler'
            ) AS handler_rated
     FROM transactions t
     JOIN properties p ON p.id = t.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     JOIN users seller ON seller.id = t.seller_id
     LEFT JOIN users handler ON handler.id = t.handler_id
     WHERE t.buyer_id = $1
     ORDER BY t.transaction_date DESC`,
    [buyerId]
  );
  return result.rows;
}
