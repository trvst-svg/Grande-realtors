import pool from "../../config/db.js";

export default async function getContractByTransaction(transactionId) {
  const result = await pool.query(
    `SELECT c.*, p.location, p.price, pt.name AS property_type,
            p.listing_type,
            COALESCE(b.bid_amount, t.amount) AS bid_amount,
            bu.firstname AS buyer_firstname, bu.lastname AS buyer_lastname,
            bu.email AS buyer_email,
            su.firstname AS seller_firstname, su.lastname AS seller_lastname,
            su.email AS seller_email
     FROM contracts c
     JOIN transactions t ON t.id = c.transaction_id
     LEFT JOIN bids b ON b.id = c.bid_id
     JOIN properties p ON p.id = c.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     JOIN users bu ON bu.id = c.buyer_id
     JOIN users su ON su.id = c.seller_id
     WHERE c.transaction_id = $1`,
    [transactionId]
  );
  return result.rows[0] || null;
}
