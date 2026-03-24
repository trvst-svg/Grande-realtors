import pool from "../../config/db.js";

export default async function getAuctionById(id) {
  const result = await pool.query(
    `SELECT a.*, p.location, p.price, p.owner_id, p.description, p.listing_type,
            p.listing_purpose, p.sale_status, pt.name AS property_type,
            img.image_url AS image,
            COALESCE((SELECT MAX(bid_amount) FROM bids WHERE auction_id = a.id), a.starting_price) AS current_price
     FROM auctions a
     JOIN properties p ON p.id = a.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     LEFT JOIN LATERAL (
       SELECT image_url
       FROM property_images
       WHERE property_id = p.id
       ORDER BY id ASC
       LIMIT 1
     ) img ON true
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0];
}
