import pool from "../../config/db.js";

export default async function getTransactionById(transactionId) {
  const result = await pool.query(
    `SELECT t.*,
            p.location,
            pt.name AS property_type,
            seller.firstname AS seller_firstname,
            seller.lastname AS seller_lastname,
            handler.firstname AS handler_firstname,
            handler.lastname AS handler_lastname
     FROM transactions t
     JOIN properties p ON p.id = t.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     JOIN users seller ON seller.id = t.seller_id
     LEFT JOIN users handler ON handler.id = t.handler_id
     WHERE t.id = $1`,
    [transactionId]
  );
  return result.rows[0] || null;
}
