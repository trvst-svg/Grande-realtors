import pool from "../../config/db.js";

export default async function listSalesHandlers() {
  const result = await pool.query(
    `SELECT u.id,
            u.firstname,
            u.lastname,
            u.email,
            u.number,
            COALESCE(ap.count, 0) AS assigned_count,
            COALESCE(rating.avg_rating, 0)::numeric(4,2) AS avg_rating
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN (
       SELECT agent_id, COUNT(*)::int AS count
       FROM assigned_properties
       GROUP BY agent_id
     ) ap ON ap.agent_id = u.id
     LEFT JOIN (
       SELECT agent_id, AVG(rating) AS avg_rating
       FROM sales_handler_rating
       GROUP BY agent_id
     ) rating ON rating.agent_id = u.id
     WHERE r.name = 'agent'
       AND u.approval_status = 'approved'
     ORDER BY assigned_count DESC, u.firstname ASC`
  );
  return result.rows;
}
