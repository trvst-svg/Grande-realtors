import pool from "../../config/db.js";

export default async function getUserDashboardStats(userId) {
  const owned = await pool.query(
    `SELECT COUNT(*)::int AS count FROM properties WHERE owner_id = $1`,
    [userId]
  );
  const favorites = await pool.query(
    `SELECT COUNT(*)::int AS count FROM favorites WHERE user_id = $1`,
    [userId]
  );
  const activeBids = await pool.query(
    `SELECT COUNT(*)::int AS count FROM bids WHERE user_id = $1`,
    [userId]
  );
  const myAuctionsCount = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM auctions a
     JOIN properties p ON p.id = a.property_id
     WHERE p.owner_id = $1`,
    [userId]
  );

  const myProperties = await pool.query(
    `SELECT p.id,
            p.location,
            p.price,
            pt.name AS property_type,
            p.sale_status,
            a.id AS auction_id,
            a.status AS auction_status
     FROM properties p
     JOIN property_types pt ON pt.id = p.property_type_id
     LEFT JOIN auctions a ON a.property_id = p.id
     WHERE p.owner_id = $1
     ORDER BY p.listed_date DESC
     LIMIT 6`,
    [userId]
  );

  const myAuctions = await pool.query(
    `SELECT a.id,
            a.status,
            a.start_time,
            a.end_time,
            a.starting_price,
            p.location,
            pt.name AS property_type,
            COALESCE((SELECT MAX(bid_amount) FROM bids WHERE auction_id = a.id), a.starting_price) AS current_price
     FROM auctions a
     JOIN properties p ON p.id = a.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     WHERE p.owner_id = $1
     ORDER BY a.id DESC
     LIMIT 6`,
    [userId]
  );

  const listedProperties = await pool.query(
    `SELECT p.id, p.location, p.price, pt.name AS property_type, p.sale_status
     FROM properties p
     JOIN property_types pt ON pt.id = p.property_type_id
     WHERE p.sale_status = 'available'
     ORDER BY p.listed_date DESC
     LIMIT 6`
  );

  return {
    stats: {
      owned: owned.rows[0].count,
      favorites: favorites.rows[0].count,
      activeBids: activeBids.rows[0].count,
      myAuctions: myAuctionsCount.rows[0].count,
    },
    myProperties: myProperties.rows,
    myAuctions: myAuctions.rows,
    listedProperties: listedProperties.rows,
  };
}
