import pool from "../config/db.js";

export async function createAuction({
  property_id,
  start_time,
  end_time,
  starting_price,
  status,
}) {
  const result = await pool.query(
    `INSERT INTO auctions
      (property_id, start_time, end_time, starting_price, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      property_id,
      start_time || null,
      end_time || null,
      starting_price,
      status || "open",
    ]
  );
  return result.rows[0];
}

export async function listAuctions() {
  const result = await pool.query(
    `SELECT a.*, p.location, p.price, pt.name AS property_type,
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

export async function getAuctionById(id) {
  const result = await pool.query(
    `SELECT a.*, p.location, p.price, pt.name AS property_type,
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

export async function getHighestBid(auction_id) {
  const result = await pool.query(
    `SELECT MAX(bid_amount) AS max_bid FROM bids WHERE auction_id = $1`,
    [auction_id]
  );
  return result.rows[0]?.max_bid || null;
}

export async function createBid({ auction_id, user_id, bid_amount }) {
  const result = await pool.query(
    `INSERT INTO bids (auction_id, user_id, bid_amount)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [auction_id, user_id, bid_amount]
  );
  return result.rows[0];
}

export async function listBidsByAuction(auction_id) {
  const result = await pool.query(
    `SELECT b.*, u.firstname, u.lastname
     FROM bids b
     JOIN users u ON u.id = b.user_id
     WHERE b.auction_id = $1
     ORDER BY b.bid_amount DESC, b.bid_time DESC`,
    [auction_id]
  );
  return result.rows;
}

export async function updateAuctionStatus(id, status) {
  const result = await pool.query(
    `UPDATE auctions SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}
