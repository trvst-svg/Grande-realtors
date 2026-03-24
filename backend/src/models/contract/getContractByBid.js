import pool from "../../config/db.js";

export default async function getContractByBid(bidId) {
  const result = await pool.query(
    `SELECT c.*, p.location, p.price, pt.name AS property_type,
            bu.firstname AS buyer_firstname, bu.lastname AS buyer_lastname,
            su.firstname AS seller_firstname, su.lastname AS seller_lastname
     FROM contracts c
     JOIN properties p ON p.id = c.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     JOIN users bu ON bu.id = c.buyer_id
     JOIN users su ON su.id = c.seller_id
     WHERE c.bid_id = $1`,
    [bidId]
  );
  return result.rows[0] || null;
}
