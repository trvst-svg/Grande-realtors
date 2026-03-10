import pool from "../../config/db.js";

export default async function listAuctions() {
  const result = await pool.query(
    `SELECT a.*, p.location, p.price, p.owner_id, pt.name AS property_type,
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
     ORDER BY a.start_time DESC NULLS LAST, a.id DESC`
  );
  return result.rows;
}
