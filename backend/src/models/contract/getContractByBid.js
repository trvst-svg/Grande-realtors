import pool from "../../config/db.js";

export default async function getContractByBid(bidId) {
  const result = await pool.query(
    `SELECT c.*, p.location, p.price, pt.name AS property_type,
            p.listing_type,
            b.bid_amount,
            bu.firstname AS buyer_firstname, bu.lastname AS buyer_lastname,
            bu.email AS buyer_email,
            su.firstname AS seller_firstname, su.lastname AS seller_lastname,
            su.email AS seller_email
     FROM contracts c
     JOIN bids b ON b.id = c.bid_id
     JOIN properties p ON p.id = c.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     JOIN users bu ON bu.id = c.buyer_id
     JOIN users su ON su.id = c.seller_id
     WHERE c.bid_id = $1`,
    [bidId]
  );
  return result.rows[0] || null;
}
