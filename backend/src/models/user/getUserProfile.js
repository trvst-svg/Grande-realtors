import pool from "../../config/db.js";

export default async function getUserProfile(userId) {
  const user = await pool.query(
    `SELECT u.id, u.firstname, u.lastname, u.email, u.number, u.created_at,
            r.name AS role, u.citizenship_front, u.citizenship_back
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [userId]
  );
  if (!user.rows[0]) return null;

  const stats = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM properties WHERE owner_id = $1) AS properties,
      (SELECT COUNT(*) FROM favorites WHERE user_id = $1) AS favorites,
      (SELECT COUNT(*) FROM bids WHERE user_id = $1) AS bids`,
    [userId]
  );

  const myProperties = await pool.query(
    `SELECT p.id,
            p.location,
            p.price,
            p.sale_status,
            pt.name AS property_type,
            a.id AS auction_id,
            a.status AS auction_status
     FROM properties p
     JOIN property_types pt ON pt.id = p.property_type_id
     LEFT JOIN auctions a ON a.property_id = p.id
     WHERE p.owner_id = $1
     ORDER BY p.listed_date DESC
     LIMIT 4`,
    [userId]
  );

  const favoriteProperties = await pool.query(
    `SELECT p.id,
            p.location,
            p.price,
            pt.name AS property_type
     FROM favorites f
     JOIN properties p ON p.id = f.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     WHERE f.user_id = $1
       AND COALESCE(p.sale_status, 'available') = 'available'
     ORDER BY f.added_at DESC
     LIMIT 4`,
    [userId]
  );

  return {
    user: user.rows[0],
    stats: stats.rows[0],
    myProperties: myProperties.rows,
    favoriteProperties: favoriteProperties.rows,
  };
}
