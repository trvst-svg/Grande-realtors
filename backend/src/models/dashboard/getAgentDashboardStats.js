import pool from "../../config/db.js";

export default async function getAgentDashboardStats(agentId) {
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
