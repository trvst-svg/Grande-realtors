import pool from "../../config/db.js";

export default async function getAdminDashboardStats() {
  const [users, properties, auctions, bids] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS count FROM users"),
    pool.query("SELECT COUNT(*)::int AS count FROM properties"),
    pool.query("SELECT COUNT(*)::int AS count FROM auctions"),
    pool.query("SELECT COUNT(*)::int AS count FROM bids"),
  ]);

  const latestUsers = await pool.query(
    `SELECT id, firstname, lastname, email, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 5`
  );

  const latestProperties = await pool.query(
    `SELECT p.id, p.location, p.price, pt.name AS property_type, p.listed_date
     FROM properties p
     JOIN property_types pt ON pt.id = p.property_type_id
     ORDER BY p.listed_date DESC
     LIMIT 5`
  );

  return {
    stats: {
      users: users.rows[0].count,
      properties: properties.rows[0].count,
      auctions: auctions.rows[0].count,
      bids: bids.rows[0].count,
    },
    latestUsers: latestUsers.rows,
    latestProperties: latestProperties.rows,
  };
}
