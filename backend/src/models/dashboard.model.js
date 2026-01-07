import pool from "../config/db.js";

export async function getAdminDashboardStats() {
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

export async function getAgentDashboardStats(agentId) {
  const assigned = await pool.query(
    `SELECT COUNT(*)::int AS count FROM assigned_properties WHERE agent_id = $1`,
    [agentId]
  );
  const inquiries = await pool.query(
    `SELECT COUNT(*)::int AS count FROM inquiries WHERE agent_id = $1`,
    [agentId]
  );
  const ratings = await pool.query(
    `SELECT COALESCE(AVG(rating), 0)::numeric(4,2) AS avg_rating
     FROM sales_handler_rating WHERE agent_id = $1`,
    [agentId]
  );

  const assignedList = await pool.query(
    `SELECT ap.id, p.location, p.price, pt.name AS property_type, ap.assigned_at
     FROM assigned_properties ap
     JOIN properties p ON p.id = ap.property_id
     JOIN property_types pt ON pt.id = p.property_type_id
     WHERE ap.agent_id = $1
     ORDER BY ap.assigned_at DESC
     LIMIT 6`,
    [agentId]
  );

  return {
    stats: {
      assigned: assigned.rows[0].count,
      inquiries: inquiries.rows[0].count,
      rating: ratings.rows[0].avg_rating,
    },
    assignedProperties: assignedList.rows,
  };
}

export async function getUserDashboardStats(userId) {
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

  const myProperties = await pool.query(
    `SELECT p.id, p.location, p.price, pt.name AS property_type, p.sale_status
     FROM properties p
     JOIN property_types pt ON pt.id = p.property_type_id
     WHERE p.owner_id = $1
     ORDER BY p.listed_date DESC
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
    },
    myProperties: myProperties.rows,
    listedProperties: listedProperties.rows,
  };
}
